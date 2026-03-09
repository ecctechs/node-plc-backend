const {
  DashboardCard,
  DeviceAddress,
  Device,
  DeviceNumberConfig,
  DeviceLevelConfig,
  DeviceAlarmRule
} = require('../models');

const sequelize = require('../models/index').sequelize;

exports.findAll = async () => {
  return await DashboardCard.findAll({
    where: { is_active: true },
    include: [
      {
        model: DeviceAddress,
        as: 'address',
        include: [
          { model: Device, as: 'device', attributes: ['id', 'name', 'device_type'] },
          { model: DeviceNumberConfig, as: 'numberConfig' },
          { model: DeviceLevelConfig, as: 'levels' },
          { model: DeviceAlarmRule, as: 'alarms' }
        ]
      }
    ],
    order: [['id', 'ASC']]
  });
};

exports.findByUserAndAddress = (userId, addressId) => {
  return DashboardCard.findOne({ where: { user_id: userId, address_id: addressId } });
};

exports.getNextPosition = async (userId) => {
  const max = await DashboardCard.max('position', { where: { user_id: userId } });
  return (max ?? 0) + 1;
};

exports.create = (data) => DashboardCard.create(data);

exports.findById = (id) => DashboardCard.findByPk(id);

// Soft delete (set is_active = false)
exports.softDelete = (id) => DashboardCard.update({ is_active: false }, { where: { id } });

// Hard delete
exports.hardDelete = (id) => DashboardCard.destroy({ where: { id } });

// Reindex all active cards for a user (consecutive 1, 2, 3, ...)
exports.reindexAll = async (userId) => {
  const cards = await DashboardCard.findAll({
    where: { user_id: userId, is_active: true },
    order: [['position', 'ASC']],
    attributes: ['id']
  });

  for (let i = 0; i < cards.length; i++) {
    await DashboardCard.update(
      { position: i + 1 },
      { where: { id: cards[i].id } }
    );
  }

  return cards.length;
};
