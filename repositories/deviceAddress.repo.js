const { DeviceAddress, Device } = require('../models');

exports.findById = (id) =>
  DeviceAddress.findByPk(id, {
    include: [{ model: Device, as: 'device', attributes: ['id', 'company_id'] }]
  });
