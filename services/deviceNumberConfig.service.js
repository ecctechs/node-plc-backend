const repo = require('../repositories/deviceNumberConfig.repo');
const addressRepo = require('../repositories/deviceAddress.repo');

/* ===========================================
   NUMBER CONFIG APIs
   Source: src/components/setting/DeviceForm.vue
   =========================================== */

// POST /api/addresses/:addressId/number-config - Save numeric display config
exports.create = async (addressId, payload) => {
  const address = await addressRepo.findById(addressId);
  if (!address) throw new Error('Address not found');

  const allowedTypes = ['number', 'number_gauge'];
  if (!allowedTypes.includes(address.data_type)) {
    throw new Error(`This address type (${address.data_type}) does not support number configuration`);
  }

  const exists = await repo.findByAddressId(addressId);
  if (exists) throw new Error('Number config already exists for this address');

  return repo.create({
    address_id: addressId,
    decimal_places: payload.decimal_places ?? 0,
    scale: payload.scale ?? 1,
    offset: payload.offset ?? 0,
    min_value: payload.min_value,
    max_value: payload.max_value,
    unit: payload.unit
  });
};

// PUT /api/addresses/:addressId/number-config - Update numeric display config
exports.update = async (addressId, payload) => {
  const address = await addressRepo.findById(addressId);
  if (!address) throw new Error('Address not found');

  const allowedTypes = ['number', 'number_gauge'];
  if (!allowedTypes.includes(address.data_type)) {
    throw new Error(`This address type (${address.data_type}) does not support number configuration`);
  }

  const existing = await repo.findByAddressId(addressId);
  if (!existing) throw new Error('Number config not found for this address');

  const [_, [updated]] = await repo.update(existing.id, {
    decimal_places: payload.decimal_places ?? existing.decimal_places,
    scale: payload.scale ?? existing.scale,
    offset: payload.offset ?? existing.offset,
    min_value: payload.min_value !== undefined ? payload.min_value : existing.min_value,
    max_value: payload.max_value !== undefined ? payload.max_value : existing.max_value,
    unit: payload.unit !== undefined ? payload.unit : existing.unit
  });

  return updated;
};

// GET /api/addresses/:addressId/number-config - Get numeric display config
exports.getByAddressId = async (addressId) => {
  const config = await repo.findByAddressId(addressId);
  if (!config) return null;
  return config;
};
