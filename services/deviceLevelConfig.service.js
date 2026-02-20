const repo = require('../repositories/deviceLevelConfig.repo');
const addressRepo = require('../repositories/deviceAddress.repo');

/* ===========================================
   LEVEL CONFIG APIs
   Source: src/components/setting/DeviceForm.vue
   =========================================== */

// POST /api/addresses/:addressId/levels - Save level ranges
exports.syncLevels = async (addressId, levelsArray) => {
  const address = await addressRepo.findById(addressId);
  if (!address) throw new Error('Address not found');
  
  if (address.data_type !== 'level') throw new Error('Address data_type must be "level"');

  if (!Array.isArray(levelsArray)) throw new Error('Payload must be an array of levels');

  levelsArray.forEach(level => validateLevel(level, false));

  await repo.removeByAddressId(addressId);

  const saved = [];
  for (let i = 0; i < levelsArray.length; i++) {
    const item = levelsArray[i];
    const row = await repo.create({
      ...item,
      level_index: i,
      address_id: addressId
    });
    saved.push(row);
  }
  return saved;
};

function validateLevel(p, isUpdate = false) {
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
