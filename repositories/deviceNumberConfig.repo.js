const { DeviceNumberConfig } = require('../models');

exports.findByAddressId = (addressId) =>
  DeviceNumberConfig.findOne({ where: { address_id: addressId } });

exports.create = (data) => DeviceNumberConfig.create(data);
