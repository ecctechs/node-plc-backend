const { ProductLog, Op } = require('../models');

// Get the latest product log entry
exports.getLatest = async () => {
  return ProductLog.findOne({
    order: [['created_at', 'DESC']]
  });
};

// Get product logs by product ID with limit
exports.findByProductId = async (productId, limit = 100) => {
  return ProductLog.findAll({
    where: { product_id: productId },
    order: [['created_at', 'DESC']],
    limit: limit
  });
};

// Get product logs within a time range
exports.findByTimeRange = async (startDate, endDate) => {
  return ProductLog.findAll({
    where: {
      created_at: {
        [Op.between]: [startDate, endDate]
      }
    },
    order: [['created_at', 'ASC']]
  });
};