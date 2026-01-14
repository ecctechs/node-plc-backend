const { DeviceNumberConfig } = require('../models');

exports.findByDeviceId = (deviceId) =>
  DeviceNumberConfig.findOne({ where: { device_id: deviceId } });

exports.create = (data) =>
  DeviceNumberConfig.create(data);

exports.updateByDeviceId = (deviceId, data) =>
  DeviceNumberConfig.update(data, {
    where: { device_id: deviceId }
  });

exports.removeByDeviceId = (deviceId) =>
  DeviceNumberConfig.destroy({
    where: { device_id: deviceId }
  });
