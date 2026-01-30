const repo = require('../repositories/deviceNumberConfig.repo');
const addressRepo = require('../repositories/deviceAddress.repo'); // สมมติว่าคุณมี repo สำหรับ address แล้ว

// ⭐ เปลี่ยนจาก deviceId เป็น addressId ทั้งหมด
exports.get = async (addressId) => {
  const address = await addressRepo.findById(addressId);
  if (!address) throw new Error('Address not found');

  return repo.findByAddressId(addressId);
};

exports.create = async (addressId, payload) => {
  // 1. ตรวจสอบว่า Address นี้มีอยู่จริงไหม
  const address = await addressRepo.findById(addressId);
  if (!address) throw new Error('Address not found');

  // 2. ตรวจสอบว่า Address นี้เป็นประเภท number หรือไม่
  if (address.data_type !== 'number') {
    throw new Error('This address is not a number data type');
  }

  // 3. ตรวจสอบว่ามี Config อยู่แล้วหรือยัง
  const exists = await repo.findByAddressId(addressId);
  if (exists) throw new Error('Number config already exists for this address');

  return repo.create({
    address_id: addressId, // ⭐ เปลี่ยนฟิลด์เป็น address_id
    decimal_places: payload.decimal_places ?? 0,
    scale: payload.scale ?? 1,
    offset: payload.offset ?? 0,
    min_value: payload.min_value,
    max_value: payload.max_value,
    unit: payload.unit
  });
};

exports.update = async (addressId, payload) => {
  const exists = await repo.findByAddressId(addressId);
  if (!exists) throw new Error('Number config not found');

  const allowed = [
    'decimal_places',
    'scale',
    'offset',
    'min_value',
    'max_value',
    'unit'
  ];

  const data = {};
  for (const k of allowed) {
    if (payload[k] !== undefined) data[k] = payload[k];
  }

  await repo.updateByAddressId(addressId, data);
  return repo.findByAddressId(addressId);
};

exports.remove = async (addressId) => {
  const exists = await repo.findByAddressId(addressId);
  if (!exists) throw new Error('Number config not found');

  await repo.removeByAddressId(addressId);
};