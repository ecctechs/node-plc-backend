const { DeviceLevelConfig } = require('../models');

exports.findByAddressId = (addressId) =>
  DeviceLevelConfig.findAll({ where: { address_id: addressId }, order: [['level_index', 'ASC']] });

exports.create = (data) => DeviceLevelConfig.create(data);

exports.removeByAddressId = (addressId) =>
  DeviceLevelConfig.destroy({ where: { address_id: addressId } });

exports.findByAddressIds = (addressIds) =>
  DeviceLevelConfig.findAll({ where: { address_id: addressIds }, order: [['address_id', 'ASC'], ['level_index', 'ASC'], ['id', 'ASC']] });
