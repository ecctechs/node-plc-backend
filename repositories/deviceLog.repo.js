const { DeviceLog, DeviceLevelConfig } = require('../models');

// Get level configs for a given address (used for chart mapping)
exports.getDeviceLevels = async (address_id) => {
  return DeviceLevelConfig.findAll({
    where: { address_id },
    order: [['level_index', 'ASC']],
    raw: true
  });
};
