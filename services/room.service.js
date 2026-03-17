const roomRepo = require('../repositories/room.repo');
const deviceRepo = require('../repositories/device.repo');

exports.getAll = async () => {
  return await roomRepo.findAll();
};

exports.getById = async (id) => {
  const room = await roomRepo.findById(id);
  if (!room) throw { status: 404, message: 'Room not found' };
  return room;
};

exports.create = async (data) => {
  const { name } = data;

  if (!name) {
    throw { status: 400, message: 'name is required' };
  }

  // Check if name already exists
  const existing = await roomRepo.findByName(name);
  if (existing) {
    throw { status: 409, message: 'Room name already exists' };
  }

  return await roomRepo.create({ name, is_active: true });
};

exports.update = async (id, data) => {
  const room = await roomRepo.findById(id);
  if (!room) {
    throw { status: 404, message: 'Room not found' };
  }

  // Check if name already exists (excluding current id)
  if (data.name) {
    const existing = await roomRepo.findByName(data.name);
    if (existing && existing.id !== id) {
      throw { status: 409, message: 'Room name already exists' };
    }
  }

  await roomRepo.update(id, data);
  return await roomRepo.findById(id);
};

exports.delete = async (id) => {
  const room = await roomRepo.findById(id);
  if (!room) {
    throw { status: 404, message: 'Room not found' };
  }

  // Check if there are devices using this room
  const devices = await deviceRepo.findByRoomId(id);
  if (devices && devices.length > 0) {
    const deviceNames = devices.map(d => d.name).join(', ');
    throw { status: 409, message: 'ไม่สามารถลบห้องนี้ได้ เนื่องจากมีอุปกรณ์ที่ใช้งานอยู่: ' + deviceNames };
  }

  await roomRepo.delete(id);
  return { success: true, message: 'Room deleted' };
};
