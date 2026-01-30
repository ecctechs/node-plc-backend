const { Device, sequelize, DeviceAddress, DeviceNumberConfig, DeviceLevelConfig } = require('../models');
const { QueryTypes, Op } = require('sequelize');

exports.findAll = async () => Device.findAll({
  include: [
    {
      model: DeviceAddress,
      as: 'addresses',
      include: [
        { model: DeviceNumberConfig, as: 'numberConfig' },
        { model: DeviceLevelConfig, as: 'levels' }
      ]
    }
  ],
  order: [['id', 'ASC']]
});

exports.findById = async (id) => Device.findByPk(id, {
  include: [{ model: DeviceAddress, as: 'addresses' }]
});

// ⭐ แก้ไขการ Create ให้รองรับการส่ง Address มาเป็น Array
exports.create = async (data) => {
  return await sequelize.transaction(async (t) => {
    const device = await Device.create({
      name: data.name,
      device_type: data.device_type,
      refresh_rate_ms: data.refresh_rate_ms || 1000,
      is_active: true
    }, { transaction: t });

    if (data.addresses && data.addresses.length > 0) {
      for (const addr of data.addresses) {
        await DeviceAddress.create({
          device_id: device.id,
          plc_address: addr.plc_address,
          label: addr.label,
          data_type: addr.data_type,
          last_value: 0
        }, { transaction: t });
      }
    }
    return device;
  });
};

// ⭐ แก้ไขการ Update (แบบง่ายที่สุดคือลบลูกเก่าแล้วสร้างใหม่ หรือ Update ตาม ID)
exports.update = async (id, data) => {
  return await sequelize.transaction(async (t) => {
    const device = await Device.findByPk(id);
    if (!device) throw new Error('Device not found');

    await device.update(data, { transaction: t });

    // ถ้ามีการส่ง addresses มาด้วย ให้ทำการ Sync (ในที่นี้ใช้วิธีลบของเก่าเขียนใหม่เพื่อความง่าย)
    if (data.addresses) {
      await DeviceAddress.destroy({ where: { device_id: id }, transaction: t });
      for (const addr of data.addresses) {
        await DeviceAddress.create({
          ...addr,
          device_id: id
        }, { transaction: t });
      }
    }
    return device;
  });
};

exports.findByName = async (name) => Device.findOne({ where: { name } });

exports.findByNameExceptId = async (name, id) => {
  return Device.findOne({
    where: {
      name,
      id: { [Op.ne]: id }
    }
  });
};

// ⭐ ปรับ SQL Query ให้ดึงข้อมูลราย Address
exports.getStatusWithLatestValue = async () => {
  return await sequelize.query(
    `
    SELECT
      d.id AS device_id,
      d.name AS device_name,
      d.last_seen_at,
      da.id AS address_id,
      da.plc_address,
      da.label,
      da.data_type,
      da.last_value,
      da.updated_at AS value_updated_at
    FROM devices d
    INNER JOIN device_addresses da ON d.id = da.device_id
    WHERE d.is_active = true
    ORDER BY d.id, da.id
    `,
    { type: QueryTypes.SELECT }
  );
};

exports.remove = async (id) => Device.destroy({ where: { id } });