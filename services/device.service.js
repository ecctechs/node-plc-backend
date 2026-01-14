const repo = require('../repositories/device.repo');
const { reloadPolling } = require('../src/jobs/plcPolling.job');

exports.list = async () => repo.findAll();

exports.getById = async (id) => repo.findById(id);

exports.create = async (payload) => {
  const { name, device_type, plc_address, refresh_rate_ms } = payload;
  if (!name || !device_type || !plc_address) {
    throw new Error('name, device_type, plc_address are required');
  }
  const exists = await repo.findByName(name);
  if (exists) {
    throw new Error(`Device name "${name}" already exists`);
  }

  const device = await repo.create({
    name,
    device_type,
    plc_address,
    refresh_rate_ms
  });

  await reloadPolling();

  return device;
};

exports.update = async (id, payload) => {
  const exists = await repo.findById(id);
  if (!exists) throw new Error('Device not found');

  if (payload.name && payload.name !== exists.name) {
    const dup = await repo.findByNameExceptId(payload.name, id);
    if (dup) {
      throw new Error(`Device name "${payload.name}" already exists`);
    }
  }

  const allowed = ['name','device_type','plc_address','refresh_rate_ms','is_active'];
  const data = {};
  for (const k of allowed) {
    if (payload[k] !== undefined) data[k] = payload[k];
  }

  const updated = await repo.update(id, data);

  await reloadPolling(); 

  return updated;
};

exports.remove = async (id) => {
  const exists = await repo.findById(id);
  if (!exists) throw new Error('Device not found');

  const result = await repo.remove(id);

  await reloadPolling(); 

  return result;
};

exports.getStatusList = async () => {
  const rows = await repo.getStatusWithLatestValue();
  const now = Date.now();

  return rows.map(r => {
    const lastSeen = r.last_seen_at
      ? new Date(r.last_seen_at).getTime()
      : null;

    const timeoutMs = r.refresh_rate_ms * 2;

    const connected =
      lastSeen !== null && (now - lastSeen) <= timeoutMs;

    return {
      id: r.id,
      name: r.name,
      value: r.value ?? false, // ถ้าไม่มี log ให้ถือ OFF
      connected,
      last_seen_at: r.last_seen_at,
      value_updated_at: r.value_updated_at
    };
  });
};