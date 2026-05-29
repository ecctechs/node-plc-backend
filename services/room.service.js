const roomRepo = require('../repositories/room.repo');
const deviceRepo = require('../repositories/device.repo');

exports.getAll = async (companyId) => {
  return await roomRepo.findAll(companyId);
};

exports.getById = async (id, companyId) => {
  const room = await roomRepo.findById(id);
  if (!room || room.company_id !== companyId) throw { status: 404, message: 'Room not found' };
  return room;
};

exports.create = async (data, companyId) => {
  const { name } = data;

  if (!name) {
    throw { status: 400, message: 'name is required' };
  }

  const existing = await roomRepo.findByName(name, companyId);
  if (existing) {
    throw { status: 409, message: 'Room name already exists' };
  }

  return await roomRepo.create({ name, is_active: true, company_id: companyId });
};

exports.update = async (id, companyId, data) => {
  const room = await roomRepo.findById(id);
  if (!room || room.company_id !== companyId) {
    throw { status: 404, message: 'Room not found' };
  }

  if (data.name) {
    const existing = await roomRepo.findByName(data.name, companyId);
    if (existing && existing.id !== parseInt(id)) {
      throw { status: 409, message: 'Room name already exists' };
    }
  }

  await roomRepo.update(id, data);
  return await roomRepo.findById(id);
};

exports.delete = async (id, companyId) => {
  const room = await roomRepo.findById(id);
  if (!room || room.company_id !== companyId) {
    throw { status: 404, message: 'Room not found' };
  }

  const devices = await deviceRepo.findByRoomId(id);
  if (devices && devices.length > 0) {
    const deviceNames = devices.map(d => d.name).join(', ');
    throw { status: 409, message: 'ไม่สามารถลบห้องนี้ได้ เนื่องจากมีอุปกรณ์ที่ใช้งานอยู่: ' + deviceNames };
  }

  await roomRepo.delete(id);
  return { success: true, message: 'Room deleted' };
};
