const { DeviceType } = require('../models');

exports.findAll = () => {
  return DeviceType.findAll({
    where: { is_active: true },
    order: [['id', 'ASC']]
  });
};

exports.findById = (id) => {
  return DeviceType.findByPk(id);
};

exports.findByName = (name) => {
  return DeviceType.findOne({ where: { name } });
};

exports.create = (data) => {
  return DeviceType.create(data);
};

exports.update = (id, data) => {
  return DeviceType.update(data, { where: { id } });
};

exports.delete = (id) => {
  return DeviceType.destroy({ where: { id } });
};
