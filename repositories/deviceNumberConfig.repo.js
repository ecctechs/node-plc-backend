const { DeviceNumberConfig } = require('../models');

/* ===========================================
   DEVICE NUMBER CONFIG REPOSITORY
   Used by: services/deviceNumberConfig.service.js
   =========================================== */

// Find number config by address ID
exports.findByAddressId = (addressId) =>
  DeviceNumberConfig.findOne({ where: { address_id: addressId } });

// Create new number config
exports.create = (data) =>
  DeviceNumberConfig.create(data);
