const {
  DashboardCard,
  DeviceAddress,
  Device,
  DeviceType,
  DeviceNumberConfig,
  DeviceLevelConfig,
  DeviceAlarmRule,
  Room
} = require('../models');

const sequelize = require('../models/index').sequelize;

// Find device addresses by device_type_id where data_type matches display_types
exports.findAddressesByDeviceTypeAndDisplayTypes = async (deviceTypeId, displayTypes) => {
  return await DeviceAddress.findAll({
    include: [
      {
        model: Device,
        as: 'device',
        where: { device_type_id: deviceTypeId },
        attributes: ['id', 'name', 'device_type_id']
      }
    ],
    where: {
      data_type: displayTypes
    }
  });
};

exports.findAll = async () => {
  return await DashboardCard.findAll({
    where: { is_active: true },
    include: [
      {
        model: DeviceAddress,
        as: 'address',
        required: true,
        include: [
          { 
            model: Device, 
            as: 'device', 
            required: true,
            where: { is_active: true },
            attributes: ['id', 'name', 'device_type_id', 'room_id'],
            include: [
              { model: DeviceType, as: 'deviceType', attributes: ['id', 'name'], required: false },
              { model: Room, as: 'room', attributes: ['id', 'name'], required: false }
            ]
          },
          { model: DeviceNumberConfig, as: 'numberConfig', required: false },
          { model: DeviceLevelConfig, as: 'levels', required: false },
          { model: DeviceAlarmRule, as: 'alarms', required: false }  
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

// Update dashboard card
exports.update = (id, data) => DashboardCard.update(data, { where: { id } });

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
