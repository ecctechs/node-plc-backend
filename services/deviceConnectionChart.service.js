const repo = require('../repositories/deviceConnectionLog.repo');

exports.getConnectionChart = async (deviceId, start, end) => {
  const rows = await repo.getConnectionChart(deviceId, start, end);

  return rows.map(r => ({
    x: r.status === 'connected' ? 1 : 0,
    y: r.created_at
  }));
};
