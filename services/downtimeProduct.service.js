const repo = require('../repositories/downtimeProduct.repo');
const { Product } = require('../models');

const verifyProduct = async (productId, companyId) => {
  const product = await Product.findOne({ where: { id: productId, company_id: companyId } });
  if (!product) throw { status: 404, message: 'ไม่พบสินค้านี้' };
};

exports.logEvent = async (productId, eventType, reason = null, companyId) => {
  await verifyProduct(productId, companyId);

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

  const events = logs.map(log => ({
    time: new Date(log.created_at).getTime(),
    type: log.event_type
  }));
  events.sort((a, b) => a.time - b.time);

  let activeCount = 0;
  let downtimeMs = 0;
  let lastActiveTime = null;

  for (const event of events) {
    if (event.type === 'START') {
      if (activeCount === 0) lastActiveTime = event.time;
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
    downtimeMs += (new Date().getTime() - lastActiveTime);
  }

  return downtimeMs / 1000;
};

exports.getDowntimeSummary = async (productId, start, end, companyId) => {
  await verifyProduct(productId, companyId);

  const logs = await repo.findByProductAndDateRange(productId, start, end);
  const downtimeSeconds = await exports.calculateDowntime(productId, start, end);
  const downtimeMinutes = downtimeSeconds / 60;

  return {
    product_id: productId,
    start,
    end,
    logs,
    downtime_seconds: downtimeSeconds,
    downtime_minutes: Math.round(downtimeMinutes * 100) / 100
  };
};
