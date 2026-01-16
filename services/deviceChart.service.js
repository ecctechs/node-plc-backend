const repo = require('../repositories/deviceLog.repo');

exports.getOnOffChart = async (deviceId, start, end) => {
  const rows = await repo.getOnOffChart(deviceId, start, end);

  return rows.map(r => ({
    x: r.value ? 1 : 0,
    y: r.created_at,
    connected: r.connection_status === 'connected'
  }));
};

exports.getNumberChart = async (deviceId, start, end) => {
  const rows = await repo.getOnOffChart(deviceId, start, end);

  return rows.map(r => ({
    x: r.value,
    y: r.created_at,
    connected: r.connection_status === 'connected'
  }));
};
