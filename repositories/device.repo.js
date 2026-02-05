const { Device, sequelize, DeviceAddress, DeviceNumberConfig, DeviceLevelConfig , DeviceAlarmRule , DeviceLog} = require('../models');
const { QueryTypes, Op } = require('sequelize');

exports.findAll = async () => Device.findAll({
  include: [
    {
      model: DeviceAddress,
      as: 'addresses',
      include: [
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
  order: [
    ['id', 'ASC'],
    [{ model: DeviceAddress, as: 'addresses' }, 'id', 'ASC']
  ]
});


exports.findById = async (id) => Device.findByPk(id, {
  include: [
    {
      model: DeviceAddress,
      as: 'addresses',
      include: [
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
  ]
});


// ⭐ แก้ไขการ Create ให้รองรับการส่ง Address มาเป็น Array
exports.create = async (data) => {
  return await sequelize.transaction(async (t) => {

    // 1. create device
    const device = await Device.create({
      name: data.name,
      device_type: data.device_type,
      refresh_rate_ms: Math.max(50, Number(data.refresh_rate_ms) || 50),
      is_active: true
    }, { transaction: t });

    // 2. create addresses
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

    // 3. query กลับมาใหม่ พร้อม addresses
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

exports.findAllAddresses = async () => {
  const rows = await DeviceAddress.findAll({
    attributes: [
      'id',
      'plc_address',
      'label',
      'data_type',
      'refresh_rate_ms',
      'is_connected',
      'last_value',
      'updated_at'
    ],
    include: [
      {
        model: Device,
        as: 'device',
        attributes: ['id', 'name', 'device_type']
      },
      {
        model: DeviceAlarmRule,
        as: 'alarms',
        separate: true,
        attributes: ['condition_type', 'min_value', 'max_value', 'severity']
      },
      // 🟢 ดึงข้อมูล Number Config (Scale, Offset, Unit, Min, Max)
      {
        model: DeviceNumberConfig,
        as: 'numberConfig', // ตรวจสอบ alias ใน DeviceAddress.associate
        attributes: ['decimal_places', 'scale', 'offset', 'min_value', 'max_value', 'unit']
      },
      // 🟢 ดึงข้อมูล Level Config (สำหรับ Data Type ที่เป็น Level)
      {
        model: DeviceLevelConfig,
        as: 'levels', // ตรวจสอบ alias ใน DeviceAddress.associate
        attributes: ['level_index', 'label', 'condition_type', 'min_value', 'max_value', 'mode', 'exact_values']
      }
    ],
    order: [
      [{ model: Device, as: 'device' }, 'id', 'ASC'],
      ['id', 'ASC']
    ]
  });

  // 🎯 Reshape เพื่อส่งให้ UI นำไปใช้ง่าย ๆ
  return rows.map(a => ({
    address_id: a.id,
    device: {
      id: a.device.id,
      name: a.device.name,
      type: a.device.device_type
    },
    label: a.label,
    plc_address: a.plc_address,
    data_type: a.data_type,
    is_connected: a.is_connected,
    last_value: a.last_value,
    is_connected: a.is_connected,
    refresh_rate_ms: a.refresh_rate_ms,
    updated_at: a.updated_at,
    
    // ส่ง Config ไปให้ UI จัดการเรื่องการคำนวณ Scale และ Unit
    numberConfig: a.numberConfig || null,
    levelConfigs: a.levelConfigs || [],

    alarm_count: a.alarms?.length || 0,
    alarms: a.alarms?.map(alarm => ({
      type: alarm.condition_type,
      min: alarm.min_value,
      max: alarm.max_value,
      severity: alarm.severity
    })) || []
  }));
};

exports.remove = async (id) => Device.destroy({ where: { id } });


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