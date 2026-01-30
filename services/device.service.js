const repo = require('../repositories/device.repo');
const { reloadPolling } = require('../src/jobs/plcPolling.job');

exports.list = async () => repo.findAll();

exports.getById = async (id) => repo.findById(id);

exports.create = async (payload) => {
  // ⭐ รับ addresses มาเป็น Array
  const { name, device_type, refresh_rate_ms, addresses } = payload;
  
  if (!name || !device_type || !addresses || !addresses.length) {
    throw new Error('Name, device_type, and at least one address are required');
  }

  const exists = await repo.findByName(name);
  if (exists) {
    throw new Error(`Device name "${name}" already exists`);
  }

  const device = await repo.create({
    name,
    device_type,
    refresh_rate_ms,
    addresses // ส่งเข้าไปที่ repo เพื่อจัดการ transaction
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

  // ⭐ เพิ่ม addresses เข้าไปใน Allowed Fields
  const allowed = ['name', 'device_type', 'refresh_rate_ms', 'is_active', 'addresses'];
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

  // ⭐ จับกลุ่มข้อมูล (Group by Device) เพราะ rows ที่ได้จาก Repo จะมีหลายบรรทัดต่อ 1 Device
  const deviceGroups = {};

  rows.forEach(r => {
    if (!deviceGroups[r.device_id]) {
      const lastSeen = r.last_seen_at ? new Date(r.last_seen_at).getTime() : null;
      // ประเมิน Connection ที่ระดับ Device (แม่)
      const timeoutMs = (r.refresh_rate_ms || 1000) * 3; // เผื่อ latency เป็น 3 เท่า
      const connected = lastSeen !== null && (now - lastSeen) <= timeoutMs;

      deviceGroups[r.device_id] = {
        id: r.device_id,
        name: r.device_name,
        connected,
        last_seen_at: r.last_seen_at,
        addresses: [] // เตรียมใส่ลูกๆ
      };
    }

    // เพิ่มข้อมูล Address ลูกเข้าไปใน Device นั้นๆ
    deviceGroups[r.device_id].addresses.push({
      address_id: r.address_id,
      plc_address: r.plc_address,
      label: r.label,
      data_type: r.data_type,
      last_value: r.last_value,
      value_updated_at: r.value_updated_at
    });
  });

  return Object.values(deviceGroups);
};