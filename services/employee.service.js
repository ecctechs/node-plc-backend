'use strict';

const repo = require('../repositories/employee.repo');

exports.getAll = async (companyId) => {
  return await repo.findAll(companyId);
};

exports.getById = async (id, companyId) => {
  const emp = await repo.findById(id, companyId);
  if (!emp) throw { status: 404, message: 'Employee not found' };
  return emp;
};

exports.create = async (data, companyId) => {
  const { employee_id, first_name, last_name, department, position, phone } = data;

  if (!employee_id || !first_name || !last_name) {
    throw { status: 400, message: 'employee_id, first_name, last_name are required' };
  }

  const existing = await repo.findByEmployeeId(employee_id, companyId);
  if (existing) throw { status: 409, message: 'employee_id already exists' };

  return await repo.create({ employee_id, first_name, last_name, department, position, phone, is_active: true, company_id: companyId });
};

exports.update = async (id, companyId, data) => {
  const emp = await repo.findById(id, companyId);
  if (!emp) throw { status: 404, message: 'Employee not found' };

  if (data.employee_id && data.employee_id !== emp.employee_id) {
    const existing = await repo.findByEmployeeId(data.employee_id, companyId);
    if (existing) throw { status: 409, message: 'employee_id already exists' };
  }

  const { employee_id, first_name, last_name, department, position, phone, is_active } = data;
  await repo.update(id, { employee_id, first_name, last_name, department, position, phone, is_active });
  return await repo.findById(id, companyId);
};

exports.delete = async (id, companyId) => {
  const emp = await repo.findById(id, companyId);
  if (!emp) throw { status: 404, message: 'Employee not found' };

  const linked = await repo.countLinkedUsers(id);
  if (linked > 0) {
    throw { status: 409, message: 'ไม่สามารถลบได้ เนื่องจากมี user เชื่อมอยู่' };
  }

  await repo.delete(id);
};
