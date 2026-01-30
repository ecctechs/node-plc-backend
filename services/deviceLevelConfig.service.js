const repo = require('../repositories/deviceLevelConfig.repo');
const addressRepo = require('../repositories/deviceAddress.repo');

exports.listByAddress = (addressId) =>
  repo.findByAddressId(addressId);

// 🔄 บันทึกแบบลบของเก่า-ลงของใหม่ (Sync) โดยอ้างอิงผ่าน Address
exports.syncLevels = async (addressId, levelsArray) => {
  // 1. ตรวจสอบว่า Address มีอยู่จริง
  const address = await addressRepo.findById(addressId);
  if (!address) throw new Error('Address not found');
  
  // ตรวจประเภท (ให้ใช้เฉพาะจุดที่ตั้งค่าเป็น level เท่านั้น)
  if (address.data_type !== 'level') throw new Error('Address data_type must be "level"');

  // 2. ตรวจสอบว่าส่งมาเป็น Array ไหม
  if (!Array.isArray(levelsArray)) throw new Error('Payload must be an array of levels');

  // 3. ตรวจสอบข้อมูลทีละตัวด้วย Logic เดิมที่คุณกำหนดไว้
  levelsArray.forEach(level => validateLevel(level, false));

  // 4. เริ่มกระบวนการ Sync (Delete & Insert)
  await repo.removeByAddressId(addressId);

  const saved = [];
  for (const item of levelsArray) {
    const row = await repo.create({
      ...item,
      address_id: addressId // ผูกข้อมูลกับ Address แทน Device
    });
    saved.push(row);
  }
  return saved;
};

exports.update = async (id, payload) => {
  validateLevel(payload, true);
  return repo.update(id, payload);
};

exports.remove = (id) => repo.remove(id);

// ===== ✅ Validation ชุดเดิมของคุณ (ห้ามตัด) =====
function validateLevel(p, isUpdate = false) {
  // ถ้าเป็น Create ต้องมี label และ condition_type
  if (!isUpdate && (!p.label || !p.condition_type)) {
    throw new Error('label and condition_type are required');
  }

  if (p.condition_type === 'BTW') {
    if (p.min_value == null || p.max_value == null) {
      throw new Error('BTW requires both min_value and max_value');
    }
    if (Number(p.min_value) >= Number(p.max_value)) {
      throw new Error('min_value must be less than max_value');
    }
  }
  
  if (p.condition_type === 'LTE' && p.max_value == null) {
    throw new Error('LTE requires max_value');
  }
  
  if (p.condition_type === 'GTE' && p.min_value == null) {
    throw new Error('GTE requires min_value');
  }
}