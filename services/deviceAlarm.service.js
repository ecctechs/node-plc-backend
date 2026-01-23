'use strict';

const repo = require('../repositories/deviceAlarm.repo');
const { Device } = require('../models');

exports.createAlarm = async (deviceId, payload) => {
  const device = await Device.findByPk(deviceId);
  if (!device) throw new Error('Device not found');

  if (payload.data_type !== device.data_display_type) {
    throw new Error('data_type does not match device display type');
  }

  return repo.createRule({
    ...payload,
    device_id: deviceId
  });
};

exports.listAlarms = (deviceId) =>
  repo.findRulesByDevice(deviceId);

exports.getAlarm = async (deviceId, alarmId) => {
  const rule = await repo.findRuleById(deviceId, alarmId);
  if (!rule) throw new Error('Alarm not found');
  return rule;
};

exports.updateAlarm = async (deviceId, alarmId, payload) => {
  const rule = await repo.findRuleById(deviceId, alarmId);
  if (!rule) throw new Error('Alarm not found');

  await repo.updateRule(alarmId, payload);
  return { message: 'Alarm updated' };
};

exports.deleteAlarm = async (deviceId, alarmId) => {
  const rule = await repo.findRuleById(deviceId, alarmId);
  if (!rule) throw new Error('Alarm not found');

  await repo.deleteRule(alarmId);
  return { message: 'Alarm deleted' };
};

exports.toggleAlarm = async (deviceId, alarmId, isActive) => {
  const rule = await repo.findRuleById(deviceId, alarmId);
  if (!rule) throw new Error('Alarm not found');

  await repo.updateRule(alarmId, { is_active: isActive });

  return {
    message: isActive ? 'Alarm enabled' : 'Alarm disabled'
  };
};


exports.listEvents = (deviceId) =>
  repo.findEventsByDevice(deviceId);
