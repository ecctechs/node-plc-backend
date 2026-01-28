'use strict';

const { DeviceAlarmRule, DeviceAlarmState, DeviceAlarmEvent, sequelize } = require('../../models');
const { sendAlarmEmail } = require('./email.service');

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

async function processAlarms(device, currentValue) {
  const rules = await DeviceAlarmRule.findAll({
    where: { device_id: device.id, is_active: true },
    include: [{ model: DeviceAlarmState, as: 'state' }]
  });

  for (const rule of rules) {
    const isTriggered = evaluateCondition(currentValue, rule);
    const currentState = rule.state;
    const now = new Date();

    // --- กรณีที่ 1: ตรวจพบความผิดปกติ (Trigger) ---
    if (isTriggered) {
      // ก) ถ้าสถานะปัจจุบันยังไม่ Active (เพิ่งเริ่มเสีย หรือเคย Recover ไปก่อนหน้านี้)
      if (!currentState || !currentState.is_active) {
        
        // เช็คว่า "เคยส่งเมลล่าสุดไปเมื่อไหร่" (แม้จะ Recover ไปแล้วก็ตาม)
        const lastEmailTime = currentState?.last_triggered_at ? new Date(currentState.last_triggered_at) : null;
        const secondsSinceLastEmail = lastEmailTime ? Math.floor((now - lastEmailTime) / 1000) : null;

        await sequelize.transaction(async (t) => {
          // 1. อัปเดตสถานะให้เป็น Active เสมอ (เพื่อบันทึก History)
          const [state, created] = await DeviceAlarmState.findOrCreate({
            where: { alarm_rule_id: rule.id, device_id: device.id },
            defaults: { is_active: true, last_triggered_at: now, last_value: currentValue },
            transaction: t
          });

          if (!created) {
            await state.update({ is_active: true, last_value: currentValue }, { transaction: t });
          }

          // 2. บันทึก Event ลง History (บันทึกทุกครั้งที่เกิด 0 -> 1)
          await DeviceAlarmEvent.create({
            device_id: device.id, alarm_rule_id: rule.id,
            event_type: 'TRIGGER', value: currentValue
          }, { transaction: t });

          // 3. เงื่อนไขการส่ง Email (กัน Spam จากค่าแกว่ง)
          // ส่งเมลเมื่อ: (ไม่เคยส่งเลย) หรือ (ส่งครั้งล่าสุดเกิน 15 นาทีที่แล้ว)
          const shouldSendEmail = (secondsSinceLastEmail === null) || (secondsSinceLastEmail >= (rule.repeat_interval_sec || 900));

          if (shouldSendEmail && rule.notify_email && rule.email_recipients?.length > 0) {
            // อัปเดตเวลาส่งเมลล่าสุด
            await state.update({ last_triggered_at: now }, { transaction: t });

            const subject = `[ALARM]  ${device.name} - ${rule.name}`;
            const html = `<h3>Alarm Triggered</h3><p>Device: ${device.name}</p><p>Value: ${currentValue}</p>`;
            sendAlarmEmail(rule.email_recipients, subject, html);
            console.log(`[ALARM EMAIL SENT] ${rule.name}`);
          } else {
            console.log(`[ALARM LOGGED] ${rule.name} - Email suppressed (Last sent ${secondsSinceLastEmail}s ago)`);
          }
        });
      }
      // ข) ถ้า Active อยู่แล้ว (Repeat Alarm)
      else if (currentState.is_active && rule.repeat_interval_sec > 0) {
        const lastTriggered = new Date(currentState.last_triggered_at);
        const secondsSinceLastNotify = Math.floor((now - lastTriggered) / 1000);

        if (secondsSinceLastNotify >= rule.repeat_interval_sec) {
          await DeviceAlarmState.update({ last_triggered_at: now }, { where: { id: currentState.id } });
          if (rule.notify_email && rule.email_recipients?.length > 0) {
            sendAlarmEmail(rule.email_recipients, `[REMINDER] ${rule.name}`, `Value: ${currentValue}`);
          }
        }
      }
    }

    // --- กรณีที่ 2: กลับมาปกติ (Recover) ---
    else if (!isTriggered && currentState && currentState.is_active) {
      await sequelize.transaction(async (t) => {
        await DeviceAlarmState.update({
          is_active: false,
          last_value: currentValue
          // สำคัญ: ห้ามล้าง last_triggered_at ทิ้ง เพื่อเอาไว้เช็คระยะห่าง 15 นาทีในรอบหน้า
        }, { where: { id: currentState.id }, transaction: t });

        await DeviceAlarmEvent.create({
          device_id: device.id, alarm_rule_id: rule.id,
          event_type: 'RECOVER', value: currentValue
        }, { transaction: t });
      });
      console.log(`[ALARM RECOVERED] ${device.name}: ${rule.name}`);
    }
  }
}

module.exports = { processAlarms };