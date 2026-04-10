const { DeviceNumberConfig } = require('../models');

exports.findByAddressId = (addressId) =>
  DeviceNumberConfig.findOne({ where: { address_id: addressId } });

exports.create = (data) => DeviceNumberConfig.create(data);

exports.update = (id, data) =>
  DeviceNumberConfig.update(data, { where: { id }, returning: true });

exports.findById = (id) => DeviceNumberConfig.findByPk(id);

exports.findByAddressIds = (addressIds) =>
  DeviceNumberConfig.findAll({ where: { address_id: addressIds }, order: [['id', 'ASC']] });
