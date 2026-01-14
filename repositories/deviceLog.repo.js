const { DeviceLog , sequelize} = require('../models');
const { Op  } = require('sequelize');
const { QueryTypes } = require('sequelize');

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