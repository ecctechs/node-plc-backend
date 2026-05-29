const { Room } = require('../models');

exports.findAll = (companyId) => {
  return Room.findAll({
    where: { is_active: true, company_id: companyId },
    order: [['id', 'ASC']]
  });
};

exports.findById = (id) => {
  return Room.findByPk(id);
};

exports.findByName = (name, companyId) => {
  return Room.findOne({ where: { name, company_id: companyId } });
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
