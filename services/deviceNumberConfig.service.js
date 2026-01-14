const repo = require('../repositories/deviceNumberConfig.repo');
const deviceRepo = require('../repositories/device.repo');

exports.get = async (deviceId) => {
  const device = await deviceRepo.findById(deviceId);
  if (!device) throw new Error('Device not found');

  return repo.findByDeviceId(deviceId);
};

exports.create = async (deviceId, payload) => {
  const device = await deviceRepo.findById(deviceId);
  if (!device) throw new Error('Device not found');

  if (device.data_display_type !== 'number' && device.data_display_type !== 'number_gauge') {
    throw new Error('Device is not number display type');
  }

  const exists = await repo.findByDeviceId(deviceId);
  if (exists) throw new Error('Number config already exists');

  return repo.create({
    device_id: deviceId,
    decimal_places: payload.decimal_places ?? 0,
    scale: payload.scale ?? 1,
    offset: payload.offset ?? 0,
    min_value: payload.min_value,
    max_value: payload.max_value,
    unit: payload.unit
  });
};

exports.update = async (deviceId, payload) => {
  const exists = await repo.findByDeviceId(deviceId);
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

  await repo.updateByDeviceId(deviceId, data);
  return repo.findByDeviceId(deviceId);
};

exports.remove = async (deviceId) => {
  const exists = await repo.findByDeviceId(deviceId);
  if (!exists) throw new Error('Number config not found');

  await repo.removeByDeviceId(deviceId);
};
