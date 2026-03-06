const repo = require('../repositories/device.repo');
const { reloadPolling } = require('../plcPoller');
const { DeviceAddress, DeviceLog } = require('../models');
const { Op } = require('sequelize');
const repoLevel = require('../repositories/deviceLevelConfig.repo');

// Map a raw value to a level config entry
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
        case 'MT':  if (min !== null && value > min) return level; break;
        case 'MTE': if (min !== null && value >= min) return level; break;
        case 'LT':  if (min !== null && value < min) return level; break;
        case 'LTE': if (min !== null && value <= min) return level; break;
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

// List all devices with addresses
exports.list = async () => {
  const devices = await repo.findAll();
  return devices.map(device => ({
    id: device.id,
    name: device.name,
    addresses: device.addresses.map(addr => ({
      id: addr.id,
      label: addr.label,
      plc_address: addr.plc_address
    }))
  }));
};

// Create device with addresses
exports.create = async (payload) => {
  const { name, device_type, refresh_rate_ms, addresses } = payload;

  if (!name || !device_type || !addresses || !addresses.length) {
    throw new Error('Name, device_type, and at least one address are required');
  }

  const exists = await repo.findByName(name);
  if (exists) throw new Error(`Device name "${name}" already exists`);

  const device = await repo.create({ name, device_type, refresh_rate_ms, addresses });
  await reloadPolling();
  return device;
};

// Get logs by address and date range
exports.getLogsByAddressAndDate = async (params) => {
  const { address_id, start, end } = params;
  
  // Get the device address to check data_type
  const deviceAddress = await DeviceAddress.findByPk(address_id);
  if (!deviceAddress) {
    throw new Error('Device address not found');
  }
  
  const logs = await repo.findByAddressAndDate(params);
  
  // If data_type is 'level', map values to level indices
  if (deviceAddress.data_type === 'level') {
    const levels = await repoLevel.findByAddressId(address_id);
    
    const series = logs.map(log => {
      const level = mapValueToLevel(log.value, levels);
      return {
        x: log.created_at,
        y: level ? level.level_index : null,
        label: level ? level.label : 'UNKNOWN',
        value: log.value,
        status: log.status
      };
    });
    
    return {
      address_id,
      data_type: 'level',
      levels: levels.map(l => ({ level_index: l.level_index, label: l.label })),
      series
    };
  }
  
  // Return raw data for other types (numbers, onoff)
  return logs;
};

// Get chart data centered around an alarm time
exports.getChartByAlarm = async (address_id, alarm_time, expand) => {
  const device = await DeviceAddress.findByPk(address_id);
  if (!device) throw new Error('Device not found');

  const refreshRateMs = device.refresh_rate_ms || 1000;
  const expandSeconds = parseInt(expand) || 20;

  const alarmTime = new Date(alarm_time);
  alarmTime.setMilliseconds(0);

  const startTime = new Date(alarmTime.getTime() - expandSeconds * 1000);
  const endTime   = new Date(alarmTime.getTime() + expandSeconds * 1000);

  const logsRaw = await DeviceLog.findAll({
    where: {
      address_id,
      created_at: { [Op.between]: [startTime, endTime] }
    },
    order: [['created_at', 'ASC']]
  });

  const logs = logsRaw.map(l => ({
    value: l.value,
    status: l.status,
    created_at: new Date(l.created_at)
  }));

  // If data_type is 'level', get level configs
  let levels = null;
  if (device.data_type === 'level') {
    levels = await repoLevel.findByAddressId(address_id);
  }

  const result = [];
  let logIndex = 0;

  for (let time = startTime.getTime(); time <= endTime.getTime(); time += refreshRateMs) {
    const windowStart = new Date(time);
    const windowEnd = new Date(time + refreshRateMs);
    const isAlarmPoint = windowStart.getTime() === alarmTime.getTime();

    let log = null;
    if (logIndex < logs.length) {
      const logTime = logs[logIndex].created_at;
      if (logTime >= windowStart && logTime < windowEnd) {
        log = logs[logIndex];
        logIndex++;
      }
    }

    if (device.data_type === 'level' && log) {
      // Map value to level for level type
      const level = mapValueToLevel(log.value, levels);
      result.push({
        x: windowStart,
        y: level ? level.level_index : null,
        label: level ? level.label : 'UNKNOWN',
        value: log.value,
        status: log.status,
        is_alarm: isAlarmPoint
      });
    } else {
      result.push({
        value: log ? log.value : null,
        status: log ? log.status : null,
        created_at: windowStart,
        is_alarm: isAlarmPoint
      });
    }
  }

  // If level type, return with level info
  if (device.data_type === 'level') {
    return {
      address_id,
      data_type: 'level',
      levels: levels.map(l => ({ level_index: l.level_index, label: l.label })),
      series: result
    };
  }

  return result;
};
