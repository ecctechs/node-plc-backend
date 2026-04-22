const repo = require('../repositories/downtimeLog.repo');
const { Op } = require('sequelize');

exports.logEvent = async (deviceId, eventType, reason = null, addressId = null) => {
  const lastEvent = await repo.getLatestEvent(deviceId, addressId);
  
  if (lastEvent && lastEvent.event_type === eventType) {
    return null;
  }
  
  return repo.create({
    device_id: deviceId,
    address_id: addressId,
    event_type: eventType,
    reason: reason
  });
};

exports.calculateDowntime = async (deviceId, start, end) => {
  const logs = await repo.findByDeviceAndDateRange(deviceId, start, end);
  
  if (!logs || logs.length === 0) {
    return 0;
  }
  
  const events = [];
  for (const log of logs) {
    events.push({
      time: new Date(log.created_at).getTime(),
      type: log.event_type
    });
  }
  events.sort((a, b) => a.time - b.time);
  
  let activeCount = 0;
  let downtimeMs = 0;
  let lastActiveTime = null;
  
  for (const event of events) {
    if (event.type === 'START') {
      if (activeCount === 0) {
        lastActiveTime = event.time;
      }
      activeCount++;
    } else if (event.type === 'END') {
      activeCount--;
      if (activeCount === 0 && lastActiveTime !== null) {
        downtimeMs += (event.time - lastActiveTime);
        lastActiveTime = null;
      }
    }
  }
  
  if (activeCount > 0 && lastActiveTime !== null) {
    const currentTime = new Date().getTime();
    downtimeMs += (currentTime - lastActiveTime);
  }
  
  return downtimeMs / 1000;
};

exports.getDowntimeSummary = async (deviceId, start, end) => {
  const logs = await repo.findByDeviceAndDateRange(deviceId, start, end);
  const downtimeSeconds = await this.calculateDowntime(deviceId, start, end);
  const downtimeMinutes = downtimeSeconds / 60;
  
  return {
    device_id: deviceId,
    start,
    end,
    logs: logs,
    downtime_seconds: downtimeSeconds,
    downtime_minutes: Math.round(downtimeMinutes * 100) / 100
  };
};