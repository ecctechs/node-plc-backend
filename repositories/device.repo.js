const { Device, sequelize, DeviceAddress, DeviceLog, Room, DeviceType, DeviceAlarmRule, DeviceAlarmState } = require('../models');
const { QueryTypes, Op } = require('sequelize');

// List all devices with their addresses
exports.findAll = async (filter = {}) => {
  const where = {};
  if (filter.is_active !== undefined) {
    where.is_active = filter.is_active === true || filter.is_active === 'true';
  }
  return await Device.findAll({
    where,
    include: [
      { model: DeviceAddress, as: 'addresses', where: { is_active: true }, required: false, attributes: ['id', 'label', 'plc_address' , 'data_type', 'refresh_rate_ms'] },
      { model: Room, as: 'room' },
      { model: DeviceType, as: 'deviceType' },
      { model: DeviceAlarmRule, as: 'alarmRules', where: { is_active: true }, required: false, include: [{ model: DeviceAlarmState, as: 'state' }] }
    ],
    order: [['id', 'ASC'], [{ model: DeviceAddress, as: 'addresses' }, 'id', 'ASC'], [{ model: DeviceAlarmRule, as: 'alarmRules' }, 'id', 'ASC']]
  });
};

// Create device with addresses in a transaction
exports.create = async (data) => {
  return await sequelize.transaction(async (t) => {
    const device = await Device.create({
      name: data.name,
      device_type_id: data.device_type_id || null,
      room_id: data.room_id || null,
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
      include: [
        { model: DeviceAddress, as: 'addresses' },
        { model: Room, as: 'room' },
        { model: DeviceType, as: 'deviceType' }
      ],
      transaction: t
    });
  });
};

// Find device by name (for duplicate check)
exports.findByName = async (name) => Device.findOne({ where: { name } });

// Find devices by device_type_id (for checking if device type is in use)
exports.findByDeviceTypeId = async (deviceTypeId) => {
  return await Device.findAll({
    where: { device_type_id: deviceTypeId }
  });
};

// Find devices by room_id (for checking if room is in use)
exports.findByRoomId = async (roomId) => {
  return await Device.findAll({
    where: { room_id: roomId }
  });
};

// Find device by id with room and addresses
exports.findById = async (id) => {
  return await Device.findByPk(id, {
    include: [
      { model: DeviceAddress, as: 'addresses' },
      { model: Room, as: 'room' },
      { model: DeviceType, as: 'deviceType' }
    ]
  });
};

// Update device with addresses in a transaction
exports.update = async (id, data) => {
  const { addresses, ...deviceData } = data;
  
  return await sequelize.transaction(async (t) => {
    // Update device basic info
    if (Object.keys(deviceData).length > 0) {
      await Device.update(deviceData, { where: { id }, transaction: t });
    }
    
    // Handle addresses if provided
    if (addresses && Array.isArray(addresses)) {
      // Get existing addresses for this device
      const existingAddresses = await DeviceAddress.findAll({
        where: { device_id: id },
        transaction: t
      });

      const existingIds = existingAddresses.map(a => a.id);
      const updatedIds = addresses.filter(a => a.id).map(a => a.id);
      
      // Soft delete addresses that are not in the updated list (set is_active=false)
      const idsToDelete = existingIds.filter(eid => !updatedIds.includes(eid));
      if (idsToDelete.length > 0) {
        await DeviceAddress.update(
          { is_active: false },
          { where: { id: idsToDelete }, transaction: t }
        );
      }

      
      // Update or create addresses
      for (const addr of addresses) {
        if (addr.id) {
          // Update existing address
          await DeviceAddress.update({
            plc_address: addr.plc_address,
            label: addr.label,
            data_type: addr.data_type,
            refresh_rate_ms: Math.max(50, Number(addr.refresh_rate_ms) || 50)
          }, { where: { id: addr.id }, transaction: t });
        } else {
          // Create new address
          await DeviceAddress.create({
            device_id: id,
            plc_address: addr.plc_address,
            label: addr.label,
            data_type: addr.data_type,
            refresh_rate_ms: Math.max(50, Number(addr.refresh_rate_ms) || 50),
            last_value: 0
          }, { transaction: t });
        }
      }
    }
    
    return await Device.findByPk(id, {
      include: [
        { model: DeviceAddress, as: 'addresses' },
        { model: Room, as: 'room' },
        { model: DeviceType, as: 'deviceType' }
      ],
      transaction: t
    });
  });
};

// Delete device (soft delete - set is_active to false)
exports.delete = async (id) => {
  return await Device.update({ is_active: false }, { where: { id } });
};

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
