const {
  DashboardCard,
  DeviceAddress,
  Device,
  DeviceNumberConfig,
  DeviceLevelConfig,
  DeviceAlarmRule
} = require('../models');

exports.findAll = async () => {
  return await DashboardCard.findAll({
    where: { is_active: true },
    include: [
      {
        model: DeviceAddress,
        as: 'address',
        include: [
          {
            model: Device,
            as: 'device',
            attributes: ['id', 'name', 'device_type']
          },
          {
            model: DeviceNumberConfig,
            as: 'numberConfig'
          },
          {
            model: DeviceLevelConfig,
            as: 'levels'
          },
          {
            model: DeviceAlarmRule,
            as: 'alarms'
          }
        ]
      }
    ],
    order: [['id', 'ASC']]
  });
};


exports.findByUserAndAddress = (userId, addressId) => {
  return DashboardCard.findOne({
    where: { user_id: userId, address_id: addressId }
  });
};

exports.getNextPosition = async (userId) => {
  const max = await DashboardCard.max('position', {
    where: { user_id: userId }
  });
  return (max ?? 0) + 1;
};

exports.create = (data) => {
  return DashboardCard.create(data);
};

exports.findById = (id) => {
  return DashboardCard.findByPk(id);
};

// ⭐ Soft delete
exports.softDelete = (id) => {
  return DashboardCard.update(
    { is_active: false },
    { where: { id } }
  );
};

// ❌ Hard delete
exports.hardDelete = (id) => {
  return DashboardCard.destroy({
    where: { id }
  });
};