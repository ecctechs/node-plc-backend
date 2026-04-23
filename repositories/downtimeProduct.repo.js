const { DowntimeProduct, Product } = require('../models');
const { Op } = require('sequelize');

exports.findByProductAndDateRange = async (productId, start, end) => {
  return DowntimeProduct.findAll({
    where: {
      product_id: productId,
      created_at: {
        [Op.between]: [start, end]
      }
    },
    order: [['created_at', 'ASC']]
  });
};

exports.findByProductId = async (productId) => {
  return DowntimeProduct.findAll({
    where: { product_id: productId },
    order: [['created_at', 'DESC']]
  });
};

exports.create = async (data) => {
  return DowntimeProduct.create(data);
};

exports.getLatestEvent = async (productId) => {
  return DowntimeProduct.findOne({
    where: { product_id: productId },
    order: [['created_at', 'DESC']]
  });
};