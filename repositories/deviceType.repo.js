const { DeviceType } = require('../models');

exports.findAll = (companyId) => {
  return DeviceType.findAll({
    where: { is_active: true, company_id: companyId },
    order: [['id', 'ASC']]
  });
};

exports.findById = (id) => {
  return DeviceType.findByPk(id);
};

exports.findByName = (name, companyId) => {
  return DeviceType.findOne({ where: { name, company_id: companyId } });
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
