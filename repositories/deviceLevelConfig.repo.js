// repositories/deviceLevelConfig.repo.js
const { DeviceLevelConfig } = require('../models');

exports.findByDevice = (deviceId) =>
  DeviceLevelConfig.findAll({
    where: { device_id: deviceId },
    order: [['level_index', 'ASC']]
  });

exports.create = (data) =>
  DeviceLevelConfig.create(data);

exports.update = async (id, data) => {
  const row = await DeviceLevelConfig.findByPk(id);
  if (!row) throw new Error('Level not found');
  return row.update(data);
};

exports.remove = async (id) => {
  const row = await DeviceLevelConfig.findByPk(id);
  if (!row) throw new Error('Level not found');
  await row.destroy();
};
