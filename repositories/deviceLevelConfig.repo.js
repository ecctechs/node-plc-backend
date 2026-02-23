const { DeviceLevelConfig } = require('../models');

exports.findByAddressId = (addressId) =>
  DeviceLevelConfig.findAll({ where: { address_id: addressId }, order: [['level_index', 'ASC']] });

exports.create = (data) => DeviceLevelConfig.create(data);

exports.removeByAddressId = (addressId) =>
  DeviceLevelConfig.destroy({ where: { address_id: addressId } });
