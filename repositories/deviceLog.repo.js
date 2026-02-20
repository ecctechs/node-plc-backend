const { DeviceLog, DeviceLevelConfig } = require('../models');

/* ===========================================
   DEVICE LOG REPOSITORY
   Used by: services/deviceChart.service.js
   =========================================== */

// Get device levels for chart mapping
exports.getDeviceLevels = async (address_id) => {
  return DeviceLevelConfig.findAll({
    where: { address_id: address_id },
    order: [['level_index', 'ASC']],
    raw: true
  });
};
