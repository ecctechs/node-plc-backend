const { DeviceLevelConfig } = require('../models');

/* ===========================================
   DEVICE LEVEL CONFIG REPOSITORY
   Used by: services/deviceLevelConfig.service.js, services/deviceChart.service.js
   =========================================== */

// Find levels by address ID
exports.findByAddressId = (addressId) =>
  DeviceLevelConfig.findAll({
    where: { address_id: addressId },
    order: [['level_index', 'ASC']]
  });

// Create new level config
exports.create = (data) =>
  DeviceLevelConfig.create(data);

// Delete all levels for an address (for sync)
exports.removeByAddressId = (addressId) =>
  DeviceLevelConfig.destroy({
    where: { address_id: addressId }
  });
