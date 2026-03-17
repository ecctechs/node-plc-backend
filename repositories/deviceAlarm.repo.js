'use strict';

const { DeviceAlarmRule, DeviceAlarmEvent, Device, DeviceAddress } = require('../models');
const { Op } = require('sequelize');

exports.createRule = async (data) => DeviceAlarmRule.create(data);

// Update alarm rule
exports.updateRule = async (id, data) =>
  DeviceAlarmRule.update(data, { where: { id }, returning: true });

// Find alarm rule by ID
exports.findById = (id) => DeviceAlarmRule.findByPk(id);

// Find all alarm rules by address ID (only active)
exports.findByAddressId = (addressId) =>
  DeviceAlarmRule.findAll({ where: { address_id: addressId, is_active: true } });

// Soft delete alarm rule - set is_active to false
exports.deleteRule = async (id) =>
  DeviceAlarmRule.update({ is_active: false }, { where: { id } });

// Build date range condition (full day)
const getDateRange = (startDate, endDate) => {
  const start = new Date(startDate);
  start.setHours(0, 0, 0, 0);
  const end = new Date(endDate);
  end.setHours(23, 59, 59, 999);
  return { [Op.between]: [start, end] };
};

exports.findAllEvents = (startDate, endDate) => {
  return DeviceAlarmEvent.findAll({
    where: { created_at: getDateRange(startDate, endDate) },
    include: [
      { model: DeviceAlarmRule, as: 'rule', attributes: ['name', 'condition_type', 'min_value', 'max_value'] },
      { model: Device, as: 'device', attributes: ['name'] }
    ],
    order: [['created_at', 'DESC']]
  });
};
