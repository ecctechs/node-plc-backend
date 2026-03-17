const repo = require('../repositories/device.repo');
const { reloadPolling } = require('../plcPoller');
const { DeviceAddress, DeviceLog } = require('../models');
const { Op } = require('sequelize');
const repoLevel = require('../repositories/deviceLevelConfig.repo');
const repoNumberConfig = require('../repositories/deviceNumberConfig.repo');

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

exports.list = async (filter = {}) => {
  const devices = await repo.findAll(filter);
  
  // Build address IDs to fetch configs
  const allAddressIds = [];
  devices.forEach(device => {
    if (device.addresses) {
      device.addresses.forEach(addr => {
        allAddressIds.push(addr.id);
      });
    }
  });
  
  // Fetch all number configs and level configs in one batch
  const numberConfigs = {};
  const levelConfigs = {};
  
  if (allAddressIds.length > 0) {
    // Get all number configs
    const numberConfigsRaw = await repoNumberConfig.findByAddressIds(allAddressIds);
    numberConfigsRaw.forEach(config => {
      numberConfigs[config.address_id] = config;
    });
    
    // Get all level configs
    const levelConfigsRaw = await repoLevel.findByAddressIds(allAddressIds);
    levelConfigsRaw.forEach(config => {
      if (!levelConfigs[config.address_id]) {
        levelConfigs[config.address_id] = [];
      }
      levelConfigs[config.address_id].push(config);
    });
  }
  
  return devices.map(device => ({
    id: device.id,
    name: device.name,
    is_active: device.is_active,
    device_type: device.deviceType ? {
      id: device.deviceType.id,
      name: device.deviceType.name,
      display_types: device.deviceType.display_types
    } : null,
    room: device.room ? {
      id: device.room.id,
      name: device.room.name
    } : null,
    addresses: device.addresses ? device.addresses.map(addr => {
      const addressData = {
        id: addr.id,
        label: addr.label,
        plc_address: addr.plc_address,
        data_type: addr.data_type || [],
        refresh_rate_ms: addr.refresh_rate_ms || []
      };
      
      // Add number config if exists
      if (numberConfigs[addr.id]) {
        addressData.number_config = {
          decimal_places: numberConfigs[addr.id].decimal_places,
          scale: numberConfigs[addr.id].scale,
          offset: numberConfigs[addr.id].offset,
          min_value: numberConfigs[addr.id].min_value,
          max_value: numberConfigs[addr.id].max_value,
          unit: numberConfigs[addr.id].unit
        };
      }

      // Add level config if exists
      if (levelConfigs[addr.id] && levelConfigs[addr.id].length > 0) {
        addressData.level_config = levelConfigs[addr.id].map(l => ({
          level_index: l.level_index,
          label: l.label,
          condition_type: l.condition_type,
          min_value: l.min_value,
          max_value: l.max_value,
          mode: l.mode,
          exact_values: l.exact_values,
          include_min: l.include_min,
          include_max: l.include_max
        }));
      }
      
      return addressData;
    }) : [],
    alarms: device.alarmRules ? device.alarmRules.map(rule => {
      // ========== FIXED SECTION ==========
      // Find matching level config using level_index (more reliable)
      let level_label = null;
      let matchedLevelIndex = rule.level_index;

      // First, try to match by level_index directly
      if (rule.level_index !== undefined && rule.level_index !== null && 
          rule.address_id && levelConfigs[rule.address_id]) {
        const levels = levelConfigs[rule.address_id];
        const foundLevel = levels.find(l => l.level_index === rule.level_index);
        if (foundLevel) {
          level_label = foundLevel.label;
          matchedLevelIndex = foundLevel.level_index;
        }
      }

      // Fallback: try matching by min/max if level_index not available or not found
      if (!level_label && rule.address_id && levelConfigs[rule.address_id]) {
        const levels = levelConfigs[rule.address_id];
        for (const level of levels) {
          // Use parseFloat for loose equality and handle decimal precision
          const minMatch = parseFloat(rule.min_value) === parseFloat(level.min_value) || 
                           (rule.min_value == null && level.min_value == null);
          const maxMatch = parseFloat(rule.max_value) === parseFloat(level.max_value) || 
                           (rule.max_value == null && level.max_value == null);
          
          if (minMatch && maxMatch) {
            level_label = level.label;
            matchedLevelIndex = level.level_index;
            break;
          }
        }
      }
      // ========== END FIXED SECTION ==========
      
      return {
        id: rule.id,
        address_id: rule.address_id,
        name: rule.name,
        data_type: rule.data_type,
        condition_type: rule.condition_type,
        min_value: rule.min_value,
        max_value: rule.max_value,
        level_index: matchedLevelIndex,
        level_label: level_label,
        duration_sec: rule.duration_sec,
        severity: rule.severity,
        is_active: rule.is_active,
        notify_email: rule.notify_email,
        email_recipients: rule.email_recipients, 
        state: rule.state ? {
          is_active: rule.state.is_active,
          last_triggered_at: rule.state.last_triggered_at,
          last_value: rule.state.last_value
        } : null
      };
    }) : []
  }));
};


// Create device with addresses
exports.create = async (payload) => {
  const { name, device_type_id, room_id, refresh_rate_ms, addresses } = payload;

  if (!name || !device_type_id || !addresses || !addresses.length) {
    throw new Error('Name, device_type_id, and at least one address are required');
  }

  const exists = await repo.findByName(name);
  if (exists) throw new Error(`Device name "${name}" already exists`);

  const device = await repo.create({ name, device_type_id, room_id, refresh_rate_ms, addresses });
  await reloadPolling();
  return device;
};

// Get device by ID with full details
exports.getById = async (id) => {
  const device = await repo.findById(id);
  if (!device) throw { status: 404, message: 'ไม่พบอุปกรณ์นี้' };
  return device;
};

// Update device
exports.update = async (id, payload) => {
  const device = await repo.findById(id);
  if (!device) throw { status: 404, message: 'ไม่พบอุปกรณ์นี้' };

  const { name, device_type_id, room_id, is_active, refresh_rate_ms, addresses } = payload;

  // Check for duplicate name (excluding current device)
  if (name && name !== device.name) {
    const exists = await repo.findByName(name);
    if (exists) throw { status: 409, message: 'ชื่ออุปกรณ์นี้มีอยู่แล้ว กรุณาใช้ชื่ออื่น' };
  }

  const updateData = { name, device_type_id, room_id, is_active, refresh_rate_ms };
  
  // Only include addresses if provided
  if (addresses !== undefined) {
    updateData.addresses = addresses;
  }

  await repo.update(id, updateData);
  await reloadPolling();
  return await repo.findById(id);
};

// Delete device (soft delete - set is_active to false)
exports.delete = async (id) => {
  const device = await repo.findById(id);
  if (!device) throw { status: 404, message: 'ไม่พบอุปกรณ์นี้' };

  await repo.delete(id);
  await reloadPolling();
  return { success: true, message: 'ลบอุปกรณ์สำเร็จ' };
};

// Get logs by address and date range
exports.getLogsByAddressAndDate = async (params) => {
  const { address_id, start, end } = params;
  
  // Check environment - for production, adjust timezone to UTC
  const isProduction = process.env.NODE_ENV === 'production';
  
  let startDate = new Date(start);
  let endDate = new Date(end);
  
  // For production: subtract 7 hours (UTC offset) from start and end times
  if (isProduction) {
    const utcOffset = 7 * 60 * 60 * 1000; // 7 hours in milliseconds
    startDate = new Date(startDate.getTime() - utcOffset);
    endDate = new Date(endDate.getTime() - utcOffset);
  }
  
  if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
    throw new Error('Invalid date format');
  }
  
  // Get the device address to check data_type
  const deviceAddress = await DeviceAddress.findByPk(address_id);
  if (!deviceAddress) {
    throw new Error('Device address not found');
  }
  
  const logs = await repo.findByAddressAndDate({ address_id, start: startDate, end: endDate });
  
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
