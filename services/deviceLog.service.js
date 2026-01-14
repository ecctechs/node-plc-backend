const repo = require('../repositories/deviceLog.repo');

exports.getLogs = async (query) => {
  const {
    device_name,
    data_type,
    address,
    action,
    page = 1,
    limit = 50
  } = query;

  return await repo.findAll({
    device_name,
    data_type,
    address,
    action,
    page: Number(page),
    limit: Number(limit)
  });
};
