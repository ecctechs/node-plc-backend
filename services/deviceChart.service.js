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


/**
 * map value -> level
 */
function mapValueToLevel(value, levels) {
  for (const level of levels) {

    // ===== EXACT =====
  if (level.mode === 'exact') {
    const exacts = (level.exact_values || []).map(v => Number(v));
    if (exacts.includes(Number(value))) {
      return level;
    }
  }

    // ===== CRITERIA =====
    if (level.mode === 'criteria') {
      const min = level.min_value;
      const max = level.max_value;

      switch (level.condition_type) {
        case 'MT':
          if (value > min) return level;
          break;
        case 'MTE':
          if (value >= min) return level;
          break;
        case 'LT':
          if (value < max) return level;
          break;
        case 'LTE':
          if (value <= max) return level;
          break;
        case 'BTW':
          if (
            (level.include_min ? value >= min : value > min) &&
            (level.include_max ? value <= max : value < max)
          ) {
            return level;
          }
          break;
      }
    }
  }

  return null;
}


exports.getLevelChart = async (deviceId, start, end, includeRaw) => {
  const logs   = await repo.getDeviceLogs(deviceId, start, end);
  const levels = await repo.getDeviceLevels(deviceId);

  const series = logs.map(log => {
    const level = mapValueToLevel(log.value, levels);

    return {
      x: log.created_at,
      y: level ? level.level_index : null,
      label: level ? level.label : 'UNKNOWN',
      ...(includeRaw ? { value: log.value } : {}),
      connected: log.connection_status === 'connected'
    };
  });

  return {
    device_id: deviceId,
    levels: levels.map(l => ({
      level_index: l.level_index,
      label: l.label
    })),
    series
  };
};
