const { Device , sequelize , DeviceNumberConfig , DeviceLevelConfig } = require('../models');
const { QueryTypes } = require('sequelize');

exports.findAll = async () => Device.findAll({
    include: [
      {
        model: DeviceNumberConfig, 
        as: 'numberConfig',
        required: false   // ⭐ INNER JOIN
      },
      {
        model: DeviceLevelConfig,
        as: 'levels',
        required: false,  // LEFT JOIN
        order: [['level_index', 'ASC']]
      }
    ],
    order: [['id', 'ASC']]
  });


exports.findById = async (id) => Device.findByPk(id);

exports.create = async (data) => {
  return Device.create({
    name: data.name,
    device_type: data.device_type,
    data_display_type: data.data_display_type, // ล็อกไว้ก่อน
    plc_address: data.plc_address,
    refresh_rate_ms: data.refresh_rate_ms || 1000,
    is_active: true
  });
};

exports.update = async (id, data) => {
  const device = await Device.findByPk(id);
  await device.update(data);
  return device;
};

exports.findByName = async (name) => {
  return Device.findOne({ where: { name } });
};

exports.findByNameExceptId = async (name, id) => {
  return Device.findOne({
    where: {
      name,
      id: { [require('sequelize').Op.ne]: id }
    }
  });
}

exports.getStatusWithLatestValue = async () => {
  return await sequelize.query(
    `
    SELECT
      d.id,
      d.name,
      d.plc_address,
      d.refresh_rate_ms,
      d.last_seen_at,
      l.value,
      l.created_at AS value_updated_at
    FROM devices d
    LEFT JOIN LATERAL (
      SELECT value, created_at
      FROM device_logs
      WHERE device_id = d.id
      ORDER BY created_at DESC
      LIMIT 1
    ) l ON true
    WHERE d.is_active = true
    ORDER BY d.id
    `,
    { type: QueryTypes.SELECT }
  );
};

exports.remove = async (id) => Device.destroy({ where: { id } });

