const repo = require('../repositories/device.repo');
const { reloadPolling } = require('../poll');
const { DeviceAddress, DeviceLog } = require('../models');
const { Op } = require('sequelize');

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
  return await repo.findByAddressAndDate(params);
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

    result.push({
      value: log ? log.value : null,
      status: log ? log.status : null,
      created_at: windowStart,
      is_alarm: isAlarmPoint
    });
  }

  return result;
};
