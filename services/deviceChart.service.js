const repo = require('../repositories/deviceLog.repo');
const repo_device = require('../repositories/device.repo');

/* ===========================================
   CHART APIs
   Source: src/components/chart/LevelChart.vue
   =========================================== */

// GET /api/devices/:id/chart/level?start={}&end={} - Level chart data
function mapValueToLevel(value, levels) {
  for (const level of levels) {
    if (level.mode === 'exact') {
      const exacts = (level.exact_values || []).map(Number);
      if (exacts.includes(Number(value))) return level;
    }

    if (level.mode === 'criteria') {
      const min = level.min_value;
      const max = level.max_value;

      switch (level.condition_type) {
        case 'MT':
          if (min !== null && value > min) return level;
          break;
        case 'MTE':
          if (min !== null && value >= min) return level;
          break;
        case 'LT':
          if (min !== null && value < min) return level;
          break;
        case 'LTE':
          if (min !== null && value <= min) return level;
          break;
        case 'BTW':
          if (
            min !== null && max !== null &&
            (level.include_min ? value >= min : value > min) &&
            (level.include_max ? value <= max : value < max)
          ) return level;
          break;
      }
    }
  }
  return null;
}

exports.getLevelChart = async (address_id, start, end, includeRaw) => {
  const para = { address_id, start, end };
  const logs   = await repo_device.findByAddressAndDate(para);
  const levels = await repo.getDeviceLevels(address_id);

  const series = logs.map(log => {
    const level = mapValueToLevel(log.value, levels);

    return {
      x: log.created_at,
      y: level ? level.level_index : null,
      label: level ? level.label : 'UNKNOWN',
      ...(includeRaw ? { value: log.value } : {}),
      connected: log.status === 1 ? 'connected' : false
    };
  });

  return {
    address_id: address_id,
    levels: levels.map(l => ({
      level_index: l.level_index,
      label: l.label
    })),
    series
  };
};
