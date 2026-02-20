const { Device, sequelize, DeviceAddress, DeviceLog } = require('../models');
const { QueryTypes, Op } = require('sequelize');

/* ===========================================
   DEVICE REPOSITORY
   Used by: services/device.service.js
   =========================================== */

// GET /api/devices - List all devices with addresses
exports.findAll = async () => Device.findAll({
  include: [
    {
      model: DeviceAddress,
      as: 'addresses',
      attributes: ['id', 'label', 'plc_address']
    }
  ],
  order: [
    ['id', 'ASC'],
    [{ model: DeviceAddress, as: 'addresses' }, 'id', 'ASC']
  ]
});

// POST /api/devices - Create new device with addresses
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

    const fullDevice = await Device.findByPk(device.id, {
      include: [
        {
          model: DeviceAddress,
          as: "addresses"
        }
      ],
      transaction: t
    });

    return fullDevice;
  });
};

// Check if device name exists (for validation)
exports.findByName = async (name) => Device.findOne({ where: { name } });

// GET /api/devices/:id/chart/level - Get logs for level chart
exports.findByAddressAndDate = async ({ address_id, start, end }) => {
  return await DeviceLog.findAll({
    where: {
      address_id,
      created_at: {
        [Op.between]: [start, end]
      }
    },
    order: [['created_at', 'ASC']],
    attributes: [
      'value',
      'status',
      'created_at'
    ]
  });
};
