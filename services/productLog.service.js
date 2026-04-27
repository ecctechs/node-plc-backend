const repo = require('../repositories/productLog.repo');

// Get the latest product log entry
exports.getLatest = async () => {
  return await repo.getLatest();
};

// Get product logs by product ID with limit
exports.getByProductId = async (productId, limit = 100) => {
  return await repo.findByProductId(productId, limit);
};

// Get product logs within a time range
exports.getByTimeRange = async (startDate, endDate) => {
  return await repo.findByTimeRange(startDate, endDate);
};