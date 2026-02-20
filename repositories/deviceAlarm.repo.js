'use strict';

const {
  DeviceAlarmRule,
  DeviceAlarmEvent,
  Device,
  DeviceAddress
} = require('../models');
const { Op } = require('sequelize');

/* ===========================================
   ALARM REPOSITORY
   Used by: services/deviceAlarm.service.js
   =========================================== */

// POST /api/addresses/:addressId/alarms - Create alarms for an address
exports.createRule = async (data) => {
  return DeviceAlarmRule.create(data);
};

// GET /api/events/all?start={}&end={} - Alarm/history listing
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
      { 
        model: DeviceAlarmRule, 
        as: 'rule',
        attributes: ['name', 'condition_type', 'min_value', 'max_value'] 
      },
      { 
        model: Device, 
        as: 'device', 
        attributes: ['name'] 
      }
    ],
    order: [['created_at', 'DESC']]
  });
};
