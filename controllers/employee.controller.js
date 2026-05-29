'use strict';

const service = require('../services/employee.service');

exports.list = async (req, res) => {
  try {
    const data = await service.getAll(req.companyId);
    res.json({ success: true, data });
  } catch (err) {
    console.error(err);
    res.status(err.status || 500).json({ success: false, message: err.message });
  }
};

exports.create = async (req, res) => {
  try {
    const data = await service.create(req.body, req.companyId);
    res.status(201).json({ success: true, data });
  } catch (err) {
    console.error(err);
    res.status(err.status || 500).json({ success: false, message: err.message });
  }
};

exports.update = async (req, res) => {
  try {
    const data = await service.update(req.params.id, req.companyId, req.body);
    res.json({ success: true, data });
  } catch (err) {
    console.error(err);
    res.status(err.status || 500).json({ success: false, message: err.message });
  }
};

exports.delete = async (req, res) => {
  try {
    await service.delete(req.params.id, req.companyId);
    res.json({ success: true, message: 'Employee deleted' });
  } catch (err) {
    console.error(err);
    res.status(err.status || 500).json({ success: false, message: err.message });
  }
};
