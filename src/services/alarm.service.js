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
 */
async function processAlarms(addressId, deviceId, currentValue) {
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
    
    // แปลง Severity เป็นตัวเล็กเพื่อใช้เช็คได้แม่นยำขึ้น
    const severity = (rule.severity || '').toLowerCase();
    const isErrorSeverity = severity === 'error' || severity === 'critical';

    // --- กรณีที่ 1: ตรวจพบความผิดปกติ (TRIGGER) ---
    if (isTriggered) {
      if (!currentState || !currentState.is_active) {
        
        const lastEmailTime = currentState?.last_triggered_at ? new Date(currentState.last_triggered_at) : null;
        const secondsSinceLastEmail = lastEmailTime ? Math.floor((now - lastEmailTime) / 1000) : null;

        await sequelize.transaction(async (t) => {
          // 1. อัปเดต/สร้างสถานะในตาราง State (ทำเสมอเพื่อเก็บ Current Status)
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
              device_id: deviceId 
            }, { transaction: t });
          }

          // ⭐ 2. บันทึกประวัติเหตุการณ์ (Log) เฉพาะ Error / Critical
          if (isErrorSeverity) {
            await DeviceAlarmEvent.create({
              device_id: deviceId, 
              address_id: addressId,
              alarm_rule_id: rule.id,
              event_type: 'TRIGGER', 
              value: currentValue
            }, { transaction: t });
          }

          // 3. จัดการเรื่องการแจ้งเตือน Email
          const shouldSendEmail = (secondsSinceLastEmail === null) || (secondsSinceLastEmail >= (rule.repeat_interval_sec || 900));

          if (shouldSendEmail && rule.notify_email && rule.email_recipients?.length > 0) {
            await state.update({ last_triggered_at: now }, { transaction: t });
            
            const subject = `[${rule.severity.toUpperCase()}] ${rule.name}`;
            const html = `
              <h3>Alarm Triggered</h3>
              <p><b>Rule:</b> ${rule.name}</p>
              <p><b>Severity:</b> ${rule.severity}</p>
              <p><b>Value:</b> ${currentValue}</p>
              <p><b>Time:</b> ${now.toLocaleString()}</p>
            `;
            sendAlarmEmail(rule.email_recipients, subject, html);
          }
        });
      }
      else if (currentState.is_active && rule.repeat_interval_sec > 0) {
        // จัดการ Reminder (ไม่ต้องบันทึก Log เพิ่ม)
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

        // ⭐ 2. บันทึกประวัติการคืนค่าลงตาราง Event เฉพาะ Error / Critical
        if (isErrorSeverity) {
          await DeviceAlarmEvent.create({
            device_id: deviceId, 
            address_id: addressId,
            alarm_rule_id: rule.id,
            event_type: 'RECOVER', 
            value: currentValue
          }, { transaction: t });
        }
      });
      
      console.log(`[RECOVERED] Rule: ${rule.name} (Severity: ${rule.severity})`);
    }
  }
}

module.exports = { processAlarms };