'use strict';

const { Op } = require('sequelize');
const { DowntimeLog, DowntimeProduct, ProductLog, DeviceLog } = require('../models');

const RETENTION_DAYS = 2;

function getCutoffDate(days = RETENTION_DAYS) {
  const d = new Date();
  d.setDate(d.getDate() - days);
  return d;
}

exports.cleanOldLogs = async () => {
  const cutoff = getCutoffDate();

  const [downtimeLogs, downtimeProducts, productLogs, deviceLogs] = await Promise.all([
    DowntimeLog.destroy({ where: { created_at: { [Op.lt]: cutoff } } }),
    DowntimeProduct.destroy({ where: { created_at: { [Op.lt]: cutoff } } }),
    ProductLog.destroy({ where: { created_at: { [Op.lt]: cutoff } } }),
    DeviceLog.destroy({ where: { created_at: { [Op.lt]: cutoff } } })
  ]);

  return {
    cutoff,
    deleted: { downtimeLogs, downtimeProducts, productLogs, deviceLogs }
  };
};
