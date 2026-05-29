'use strict';

const { Employee, User } = require('../models');

exports.findAll = (companyId) => {
  return Employee.findAll({ where: { company_id: companyId }, order: [['id', 'ASC']] });
};

exports.findById = (id, companyId) => {
  const where = { id };
  if (companyId !== undefined) where.company_id = companyId;
  return Employee.findOne({ where });
};

exports.findByEmployeeId = (employee_id, companyId) => {
  return Employee.findOne({ where: { employee_id, company_id: companyId } });
};

exports.create = (data) => {
  return Employee.create(data);
};

exports.update = (id, data) => {
  return Employee.update(data, { where: { id } });
};

exports.delete = (id) => {
  return Employee.destroy({ where: { id } });
};

exports.countLinkedUsers = (id) => {
  return User.count({ where: { employee_id: id } });
};
