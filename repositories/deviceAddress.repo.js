const { DeviceAddress } = require('../models');

/* ===========================================
   DEVICE ADDRESS REPOSITORY
   Used by: services/deviceLevelConfig.service.js, services/deviceNumberConfig.service.js, services/deviceAlarm.service.js
   =========================================== */

// Find address by ID (used in config services)
exports.findById = (id) => 
  DeviceAddress.findByPk(id);
