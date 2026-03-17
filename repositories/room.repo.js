const { Room } = require('../models');

exports.findAll = () => {
  return Room.findAll({
    where: { is_active: true },
    order: [['id', 'ASC']]
  });
};

exports.findById = (id) => {
  return Room.findByPk(id);
};

exports.findByName = (name) => {
  return Room.findOne({ where: { name } });
};

exports.create = (data) => {
  return Room.create(data);
};

exports.update = (id, data) => {
  return Room.update(data, { where: { id } });
};

exports.delete = (id) => {
  return Room.destroy({ where: { id } });
};
