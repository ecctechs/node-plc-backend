const { Product } = require('../models');

exports.findAll = async (filter = {}) => {
  return Product.findAll({
    where: filter,
    order: [['id', 'ASC']]
  });
};

exports.findById = async (id) => {
  return Product.findByPk(id);
};

exports.findByName = async (name) => {
  return Product.findOne({ where: { name } });
};

exports.create = async (data) => {
  return Product.create(data);
};

exports.update = async (id, data) => {
  const product = await Product.findByPk(id);
  if (!product) return null;
  
  return product.update(data);
};

exports.delete = async (id) => {
  const product = await Product.findByPk(id);
  if (!product) return null;
  
  return product.destroy();
};