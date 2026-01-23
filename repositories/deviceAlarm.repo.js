'use strict';

const {
  DeviceAlarmRule,
  DeviceAlarmState,
  DeviceAlarmEvent,
  Device
} = require('../models');

exports.createRule = (data) => DeviceAlarmRule.create(data);

exports.findRulesByDevice = (deviceId) =>
  DeviceAlarmRule.findAll({
    where: { device_id: deviceId },
    order: [['id', 'ASC']]
  });

exports.findRuleById = (deviceId, alarmId) =>
  DeviceAlarmRule.findOne({
    where: { id: alarmId, device_id: deviceId }
  });

exports.updateRule = (alarmId, data) =>
  DeviceAlarmRule.update(data, { where: { id: alarmId } });


exports.deleteRule = (alarmId) =>
  DeviceAlarmRule.destroy({ where: { id: alarmId } });

/* ===== State ===== */
exports.findState = (deviceId, alarmRuleId) =>
  DeviceAlarmState.findOne({
    where: { device_id: deviceId, alarm_rule_id: alarmRuleId }
  });

exports.upsertState = (data) =>
  DeviceAlarmState.upsert(data);

/* ===== Event ===== */
exports.createEvent = (data) =>
  DeviceAlarmEvent.create(data);

exports.findEventsByDevice = (deviceId) =>
  DeviceAlarmEvent.findAll({
    where: { device_id: deviceId },
    include: [
      {
        model: Device,
        as: 'device',
        attributes: [ 'name'] // เลือก field ของ device ที่ต้องการ
      },
      {
        model: DeviceAlarmRule,
        as: 'rule',
        attributes: ['name','condition_type','min_value','max_value'] // เลือก field ของ rule ที่ต้องการ
      }
    ],
    attributes: ['id', 'device_id', 'alarm_rule_id','event_type', 'created_at' , 'value'],
    order: [['created_at', 'DESC']]
  });