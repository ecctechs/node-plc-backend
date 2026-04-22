const { DowntimeLog, Device } = require('../models');
const { Op } = require('sequelize');

exports.findByDeviceAndDateRange = async (deviceId, start, end) => {
  return DowntimeLog.findAll({
    where: {
      device_id: deviceId,
      created_at: {
        [Op.between]: [start, end]
      }
    },
    order: [['created_at', 'ASC']]
  });
};

exports.findByDeviceId = async (deviceId) => {
  return DowntimeLog.findAll({
    where: { device_id: deviceId },
    order: [['created_at', 'DESC']]
  });
};

exports.create = async (data) => {
  return DowntimeLog.create(data);
};

exports.getLatestEvent = async (deviceId, addressId = null) => {
  const where = { device_id: deviceId };
  if (addressId) {
    where.address_id = addressId;
  }
  return DowntimeLog.findOne({
    where,
    order: [['created_at', 'DESC']]
  });
};