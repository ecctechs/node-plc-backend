const repo = require('../repositories/downtimeProduct.repo');
const { Op } = require('sequelize');

exports.logEvent = async (productId, eventType, reason = null) => {
  const lastEvent = await repo.getLatestEvent(productId);

  if (lastEvent && lastEvent.event_type === eventType) {
    return null;
  }

  return repo.create({
    product_id: productId,
    event_type: eventType,
    reason: reason
  });
};

exports.calculateDowntime = async (productId, start, end) => {
  const logs = await repo.findByProductAndDateRange(productId, start, end);

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

exports.getDowntimeSummary = async (productId, start, end) => {
  const logs = await repo.findByProductAndDateRange(productId, start, end);
  const downtimeSeconds = await this.calculateDowntime(productId, start, end);
  const downtimeMinutes = downtimeSeconds / 60;

  return {
    product_id: productId,
    start,
    end,
    logs: logs,
    downtime_seconds: downtimeSeconds,
    downtime_minutes: Math.round(downtimeMinutes * 100) / 100
  };
};