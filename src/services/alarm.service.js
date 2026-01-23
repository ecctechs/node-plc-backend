'use strict';

const { DeviceAlarmRule, DeviceAlarmState, DeviceAlarmEvent, sequelize } = require('../../models');
const { sendAlarmEmail } = require('./email.service');

/**
 * ฟังก์ชันหลักสำหรับตรวจสอบ Logic ตาม condition_type ที่กำหนด
 */
function evaluateCondition(value, rule) {
  const min = rule.min_value;
  const max = rule.max_value;

  switch (rule.condition_type) {
    case 'EXACT': return value === min;
    case 'MT':    return value > min;
    case 'MTE':   return value >= min;
    // ปรับ LT/LTE ให้เช็ค max ถ้าไม่มีให้ไปเช็ค min
    case 'LT':    return value < (max !== null && max !== undefined ? max : min);
    case 'LTE':   return value <= (max !== null && max !== undefined ? max : min);
    case 'BTW':   return value >= min && value <= max;
    default:      return false;
  }
}

/**
 * ตรวจสอบและจัดการ Alarm สำหรับ Device
 */
async function processAlarms(device, currentValue) {
  // 1. ดึง Rules ทั้งหมดของ Device นี้ที่เปิดใช้งานอยู่
  const rules = await DeviceAlarmRule.findAll({
    where: { device_id: device.id, is_active: true },
    include: [{ model: DeviceAlarmState, as: 'state' }]
  });

  for (const rule of rules) {

    
    const isTriggered = evaluateCondition(currentValue, rule);
    const currentState = rule.state; // ข้อมูลจากตาราง device_alarm_states
    const now = new Date();

    // กรณีที่ 1: เกิด Alarm ใหม่ (Trigger)
    // เงื่อนไข: ค่าเข้าเกณฑ์ และ (ยังไม่เคยมี State หรือ State ปัจจุบันคือยังไม่ Active)
    if (isTriggered && (!currentState || !currentState.is_active)) {
      await sequelize.transaction(async (t) => {
        // อัปเดตหรือสร้าง State
        await DeviceAlarmState.upsert({
          device_id: device.id,
          alarm_rule_id: rule.id,
          is_active: true,
          last_triggered_at: now,
          last_value: currentValue
        }, { transaction: t });

        // บันทึก Event ขา Trigger
        await DeviceAlarmEvent.create({
          device_id: device.id,
          alarm_rule_id: rule.id,
          event_type: 'TRIGGER',
          value: currentValue
        }, { transaction: t });

        console.log(`[ALARM TRIGGERED] ${device.name}: ${rule.name} (Value: ${currentValue})`);
        
        // TODO: ส่ง Email แจ้งเตือนที่นี่หาก rule.notify_email เป็น true
        // ⭐ ส่วนส่งอีเมลแจ้งเตือน
        if (rule.notify_email && rule.email_recipients && rule.email_recipients.length > 0) {
          const subject = `[ALARM] ${rule.severity.toUpperCase()}: ${device.name} - ${rule.name}`;
          const html = `
            <h3>Alarm Triggered</h3>
            <p><strong>Device:</strong> ${device.name}</p>
            <p><strong>Alarm Name:</strong> ${rule.name}</p>
            <p><strong>Severity:</strong> ${rule.severity}</p>
            <p><strong>Current Value:</strong> ${currentValue}</p>
            <p><strong>Time:</strong> ${now.toLocaleString()}</p>
          `;
          
          // ส่งแบบ Background (ไม่ต้อง await เพื่อไม่ให้ Polling ช้า)
          sendAlarmEmail(rule.email_recipients, subject, html);
        }
      });
    }

    // กรณีที่ 2: Alarm หายไปแล้ว (Recover)
    // เงื่อนไข: ค่าไม่เข้าเกณฑ์ และ (มี State เดิมที่ Active อยู่)
    else if (!isTriggered && currentState && currentState.is_active) {
      await sequelize.transaction(async (t) => {
        await DeviceAlarmState.update({
          is_active: false,
          last_value: currentValue
        }, { 
          where: { id: currentState.id },
          transaction: t 
        });

        // บันทึก Event ขา Recover
        await DeviceAlarmEvent.create({
          device_id: device.id,
          alarm_rule_id: rule.id,
          event_type: 'RECOVER',
          value: currentValue
        }, { transaction: t });

        console.log(`[ALARM RECOVERED] ${device.name}: ${rule.name}`);
      });
    }
  }
}

module.exports = {
  processAlarms
};