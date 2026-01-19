// services/deviceLevel.service.js
const repo = require('../repositories/deviceLevelConfig.repo');

exports.listByDevice = (deviceId) =>
  repo.findByDevice(deviceId);

exports.create = async (deviceId, payload) => {
  validateCreate(payload);
  return repo.create({ ...payload, device_id: deviceId });
};

exports.update = async (id, payload) => {
  validateUpdate(payload);
  return repo.update(id, payload);
};

// ===== validation =====
function validateCreate(p) {
  if (!p.label || !p.condition_type) {
    throw new Error('label and condition_type are required');
  }

  if (p.condition_type === 'BTW') {
    if (p.min_value == null || p.max_value == null) {
      throw new Error('BTW requires min_value and max_value');
    }
    if (p.min_value >= p.max_value) {
      throw new Error('min_value must be < max_value');
    }
  }
}

function validateUpdate(p) {
  // ถ้าแก้ condition_type → ค่อย validate
  if (p.condition_type === 'BTW') {
    if (p.min_value == null || p.max_value == null) {
      throw new Error('BTW requires min_value and max_value');
    }
    if (p.min_value >= p.max_value) {
      throw new Error('min_value must be < max_value');
    }
  }
}