const { DeviceConnectionLog } = require('../models');
const { Op } = require('sequelize');

exports.getConnectionChart = async (deviceId, start, end) => {
  return await DeviceConnectionLog.findAll({
    where: {
      device_id: deviceId,
      created_at: {
        [Op.between]: [start, end]
      }
    },
    attributes: ['status', 'created_at'],
    order: [['created_at', 'ASC']],
    raw: true
  });
};
