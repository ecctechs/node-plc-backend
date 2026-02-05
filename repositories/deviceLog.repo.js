const { DeviceLog , sequelize , DeviceLevelConfig} = require('../models');
const { Op  } = require('sequelize');
const { QueryTypes , Sequelize } = require('sequelize');

exports.findAll = async ({
  device_name,
  data_type,
  address,
  action,
  page,
  limit
}) => {

  const where = {};

  if (device_name) where.device_name = device_name;
  if (data_type) where.data_type = data_type;
  if (address) where.address = address;
  if (action) where.action = action;

  const offset = (page - 1) * limit;

  const { rows, count } = await DeviceLog.findAndCountAll({
    where,
    order: [['created_at', 'DESC']],
    limit,
    offset
  });

  return {
    data: rows,
    meta: {
      total: count,
      page,
      limit
    }
  };
};

exports.getOnOffChart = async (deviceId, start, end) => {
  return await sequelize.query(
    `
    SELECT
      dl.value,
      dl.created_at,
      (
        SELECT dcl.status
        FROM device_connection_logs dcl
        WHERE dcl.device_id = dl.device_id
          AND dcl.created_at <= dl.created_at
        ORDER BY dcl.created_at DESC
        LIMIT 1
      ) AS connection_status
    FROM device_logs dl
    WHERE dl.device_id = :deviceId
      AND dl.created_at BETWEEN :start AND :end
    ORDER BY dl.created_at ASC
    `,
    {
      replacements: { deviceId, start, end },
      type: QueryTypes.SELECT
    }
  );
};

// exports.getNumberChart = async (deviceId, start, end) => {
//   return DeviceLog.findAll({
//     where: {
//       device_id: deviceId,
//       created_at: {
//         [Op.between]: [start, end]
//       }
//     },
//     attributes: ['value', 'created_at'],
//     order: [['created_at', 'ASC']]
//   });
// };

exports.getDeviceLogs = async (deviceId, start, end) => {
  return DeviceLog.findAll({
    where: {
      device_id: deviceId,
      created_at: { [Op.between]: [start, end] }
    },
    attributes: [
      'value',
      'created_at',
      [
        Sequelize.literal(`(
          SELECT dcl.status
          FROM device_connection_logs dcl
          WHERE dcl.device_id = "DeviceLog"."device_id"
            AND dcl.created_at <= "DeviceLog"."created_at"
          ORDER BY dcl.created_at DESC
          LIMIT 1
        )`),
        'connection_status'
      ]
    ],
    order: [['created_at', 'ASC']],
    raw: true
  });
};

exports.getDeviceLevels = async (address_id) => {
  return DeviceLevelConfig.findAll({
    where: { address_id: address_id },
    order: [['level_index', 'ASC']],
    raw: true
  });
};