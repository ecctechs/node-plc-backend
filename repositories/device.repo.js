const { Device, sequelize, DeviceAddress, DeviceLog } = require('../models');
const { QueryTypes, Op } = require('sequelize');

// List all devices with their addresses
exports.findAll = async () => Device.findAll({
  include: [{ model: DeviceAddress, as: 'addresses', attributes: ['id', 'label', 'plc_address'] }],
  order: [['id', 'ASC'], [{ model: DeviceAddress, as: 'addresses' }, 'id', 'ASC']]
});

// Create device with addresses in a transaction
exports.create = async (data) => {
  return await sequelize.transaction(async (t) => {
    const device = await Device.create({
      name: data.name,
      device_type: data.device_type,
      refresh_rate_ms: Math.max(50, Number(data.refresh_rate_ms) || 50),
      is_active: true
    }, { transaction: t });

    if (data.addresses && data.addresses.length > 0) {
      for (const addr of data.addresses) {
        await DeviceAddress.create({
          device_id: device.id,
          plc_address: addr.plc_address,
          label: addr.label,
          data_type: addr.data_type,
          refresh_rate_ms: Math.max(50, Number(addr.refresh_rate_ms) || 50),
          last_value: 0
        }, { transaction: t });
      }
    }

    return await Device.findByPk(device.id, {
      include: [{ model: DeviceAddress, as: 'addresses' }],
      transaction: t
    });
  });
};

// Find device by name (for duplicate check)
exports.findByName = async (name) => Device.findOne({ where: { name } });

// Get logs for a given address and date range
exports.findByAddressAndDate = async ({ address_id, start, end }) => {
  return await DeviceLog.findAll({
    where: {
      address_id,
      created_at: { [Op.between]: [start, end] }
    },
    order: [['created_at', 'ASC']],
    attributes: ['value', 'status', 'created_at']
  });
};
