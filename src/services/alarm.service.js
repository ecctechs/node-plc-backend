'use strict';

const { DeviceAlarmRule, DeviceAlarmState, DeviceAlarmEvent, sequelize } = require('../../models');
const { sendAlarmEmail } = require('./email.service');

/**
 * ฟังก์ชันตรวจสอบเงื่อนไข (Condition Evaluator)
 */
function evaluateCondition(value, rule) {
  const min = rule.min_value;
  const max = rule.max_value;
  switch (rule.condition_type) {
    case 'EXACT': return value === min;
    case 'MT':    return value > min;
    case 'MTE':   return value >= min;
    case 'LT':    return value < (max !== null && max !== undefined ? max : min);
    case 'LTE':   return value <= (max !== null && max !== undefined ? max : min);
    case 'BTW':   return value >= min && value <= max;
    default:      return false;
  }
}

/**
 * ฟังก์ชันหลักในการประมวลผล Alarm
 * @param {Number} addressId - ID จากตาราง device_addresses
 * @param {Number} deviceId - ID จากตาราง devices
 * @param {Number} currentValue - ค่าที่อ่านได้จาก PLC
 */
async function processAlarms(addressId, deviceId, currentValue) {
  // 1. ดึง Rules ที่ผูกกับ address_id นี้ และดึง State ปัจจุบันมาด้วย
  const rules = await DeviceAlarmRule.findAll({
    where: { 
      address_id: addressId, 
      is_active: true 
    },
    include: [{ model: DeviceAlarmState, as: 'state' }]
  });

  for (const rule of rules) {
    const isTriggered = evaluateCondition(currentValue, rule);
    const currentState = rule.state;
    const now = new Date();

    // --- กรณีที่ 1: ตรวจพบความผิดปกติ (TRIGGER) ---
    if (isTriggered) {
      // ก) ถ้าสถานะปัจจุบันยังไม่ Active (เพิ่งเกิด หรือเคยคืนค่าไปแล้ว)
      if (!currentState || !currentState.is_active) {
        
        // เช็คระยะห่างการส่งเมลล่าสุดจาก last_triggered_at ใน State (ถ้ามี)
        const lastEmailTime = currentState?.last_triggered_at ? new Date(currentState.last_triggered_at) : null;
        const secondsSinceLastEmail = lastEmailTime ? Math.floor((now - lastEmailTime) / 1000) : null;

        await sequelize.transaction(async (t) => {
          // 1. อัปเดต/สร้างสถานะในตาราง DeviceAlarmState
          // ระบุทั้ง address_id และ device_id ตาม Model ใหม่
          const [state, created] = await DeviceAlarmState.findOrCreate({
            where: { 
              alarm_rule_id: rule.id, 
              address_id: addressId 
            },
            defaults: { 
              is_active: true, 
              last_triggered_at: now, 
              last_value: currentValue,
              device_id: deviceId 
            },
            transaction: t
          });

          if (!created) {
            await state.update({ 
              is_active: true, 
              last_value: currentValue,
              device_id: deviceId // เผื่อมีการย้าย Device
            }, { transaction: t });
          }

          // 2. บันทึกประวัติเหตุการณ์ลงตาราง DeviceAlarmEvent
          // เพิ่ม address_id ให้สอดคล้องกับ Model ใหม่ที่คุณสร้าง
          await DeviceAlarmEvent.create({
            device_id: deviceId, 
            address_id: addressId,
            alarm_rule_id: rule.id,
            event_type: 'TRIGGER', 
            value: currentValue
          }, { transaction: t });

          // 3. จัดการเรื่องการแจ้งเตือน Email
          const shouldSendEmail = (secondsSinceLastEmail === null) || (secondsSinceLastEmail >= (rule.repeat_interval_sec || 900));

          if (shouldSendEmail && rule.notify_email && rule.email_recipients?.length > 0) {
            // อัปเดตเวลาที่ส่งเมลล่าสุด
            await state.update({ last_triggered_at: now }, { transaction: t });
            
            const subject = `[ALARM] ${rule.name}`;
            const html = `
              <h3>Alarm Triggered</h3>
              <p><b>Rule:</b> ${rule.name}</p>
              <p><b>Value:</b> ${currentValue}</p>
              <p><b>Address ID:</b> ${addressId}</p>
              <p><b>Device ID:</b> ${deviceId}</p>
              <p><b>Time:</b> ${now.toLocaleString()}</p>
            `;
            sendAlarmEmail(rule.email_recipients, subject, html);
          }
        });
      }
      // ข) ถ้าสถานะ Active อยู่แล้ว (ตรวจสอบการแจ้งเตือนซ้ำ - Reminder)
      else if (currentState.is_active && rule.repeat_interval_sec > 0) {
        const lastTriggered = new Date(currentState.last_triggered_at);
        const secondsSinceLastNotify = Math.floor((now - lastTriggered) / 1000);

        if (secondsSinceLastNotify >= rule.repeat_interval_sec) {
          await DeviceAlarmState.update(
            { last_triggered_at: now }, 
            { where: { id: currentState.id } }
          );

          if (rule.notify_email && rule.email_recipients?.length > 0) {
            sendAlarmEmail(
              rule.email_recipients, 
              `[REMINDER] ${rule.name}`, 
              `The condition is still met. Current value: ${currentValue}`
            );
          }
        }
      }
    }

    // --- กรณีที่ 2: ค่ากลับมาเป็นปกติ (RECOVER) ---
    else if (!isTriggered && currentState && currentState.is_active) {
      await sequelize.transaction(async (t) => {
        // 1. ปิดสถานะ Active ในตาราง State
        await DeviceAlarmState.update({
          is_active: false,
          last_value: currentValue
        }, { 
          where: { id: currentState.id }, 
          transaction: t 
        });

        // 2. บันทึกประวัติการคืนค่าลงตาราง Event
        // เพิ่ม address_id ให้สอดคล้องกับ Model ใหม่
        await DeviceAlarmEvent.create({
          device_id: deviceId, 
          address_id: addressId,
          alarm_rule_id: rule.id,
          event_type: 'RECOVER', 
          value: currentValue
        }, { transaction: t });
      });
      
      console.log(`[RECOVERED] Rule: ${rule.name} (Address: ${addressId})`);
    }
  }
}

module.exports = { processAlarms };