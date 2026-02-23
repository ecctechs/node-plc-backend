'use strict';

const { DeviceAlarmRule, DeviceAlarmState, DeviceAlarmEvent, sequelize } = require('../../models');
const { sendAlarmEmail } = require('./email.service');

// Evaluate alarm condition against current value
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

// Process all alarm rules for a given address and value
async function processAlarms(addressId, deviceId, currentValue) {
  const rules = await DeviceAlarmRule.findAll({
    where: { address_id: addressId, is_active: true },
    include: [{ model: DeviceAlarmState, as: 'state' }]
  });

  for (const rule of rules) {
    const isTriggered = evaluateCondition(currentValue, rule);
    const currentState = rule.state;
    const now = new Date();

    const severity = (rule.severity || '').toLowerCase();
    const isErrorSeverity = severity === 'error' || severity === 'critical';

    // Case 1: Alarm triggered
    if (isTriggered) {
      if (!currentState || !currentState.is_active) {
        const lastEmailTime = currentState?.last_triggered_at ? new Date(currentState.last_triggered_at) : null;
        const secondsSinceLastEmail = lastEmailTime ? Math.floor((now - lastEmailTime) / 1000) : null;

        await sequelize.transaction(async (t) => {
          const [state, created] = await DeviceAlarmState.findOrCreate({
            where: { alarm_rule_id: rule.id, address_id: addressId },
            defaults: { is_active: true, last_triggered_at: now, last_value: currentValue, device_id: deviceId },
            transaction: t
          });

          if (!created) {
            await state.update({ is_active: true, last_value: currentValue, device_id: deviceId }, { transaction: t });
          }

          // Log event for error/critical severity only
          if (isErrorSeverity) {
            await DeviceAlarmEvent.create({
              device_id: deviceId,
              address_id: addressId,
              alarm_rule_id: rule.id,
              event_type: 'TRIGGER',
              value: currentValue
            }, { transaction: t });
          }

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
      } else if (currentState.is_active && rule.repeat_interval_sec > 0) {
        // Send reminder if interval elapsed
        const secondsSinceLastNotify = Math.floor((now - new Date(currentState.last_triggered_at)) / 1000);

        if (secondsSinceLastNotify >= rule.repeat_interval_sec) {
          await DeviceAlarmState.update({ last_triggered_at: now }, { where: { id: currentState.id } });

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

    // Case 2: Alarm recovered
    else if (!isTriggered && currentState && currentState.is_active) {
      await sequelize.transaction(async (t) => {
        await DeviceAlarmState.update(
          { is_active: false, last_value: currentValue },
          { where: { id: currentState.id }, transaction: t }
        );

        // Log recovery for error/critical severity only
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
