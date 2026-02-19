const repo = require('../repositories/device.repo');
const { reloadPolling } = require('../poll');


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
    addresses 
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

exports.getAllAddresses = async () => {
  return await repo.findAllAddresses();
};

exports.getLogsByAddressAndDate = async (params) => {
  return await repo.findByAddressAndDate(params);
};

const { DeviceAddress, DeviceLog } = require('../models');
const { Op } = require('sequelize');

exports.getChartByAlarm = async (address_id, alarm_time, expand) => {

  const device = await DeviceAddress.findByPk(address_id);
  if (!device) throw new Error('Device not found');

  const refreshRateMs = device.refresh_rate_ms || 1000;
  const expandSeconds = parseInt(expand) || 20;

  // ⭐ ทำให้ alarmTime ชัดเจนระดับวินาที
  const alarmTime = new Date(alarm_time);
  alarmTime.setMilliseconds(0);

  const startTime = new Date(alarmTime.getTime() - expandSeconds * 1000);
  const endTime   = new Date(alarmTime.getTime() + expandSeconds * 1000);

  // ⭐ ดึง log ทั้งช่วง
  const logsRaw = await DeviceLog.findAll({
    where: {
      address_id,
      created_at: {
        [Op.between]: [startTime, endTime]
      }
    },
    order: [['created_at', 'ASC']]
  });

  // ⭐ บังคับให้ created_at เป็น Date object 100%
  const logs = logsRaw.map(l => ({
    value: l.value,
    status: l.status,
    created_at: new Date(l.created_at)
  }));

  const result = [];
  let logIndex = 0;

  // ⭐ loop สร้างจุดข้อมูล
  for (
    let time = startTime.getTime();
    time <= endTime.getTime();
    time += refreshRateMs
  ) {
    const windowStart = new Date(time);
    const windowEnd = new Date(time + refreshRateMs);

    // ตรวจสอบว่าเวลาใน Loop นี้ตรงกับ Alarm Time หรือไม่
    const isAlarmPoint = windowStart.getTime() === alarmTime.getTime();

    let log = null;
    if (logIndex < logs.length) {
      const logTime = logs[logIndex].created_at;

      if (logTime >= windowStart && logTime < windowEnd) {
        log = logs[logIndex];
        logIndex++;
      }
    }

    result.push({
      value: log ? log.value : null,
      status: log ? log.status : null,
      created_at: windowStart,
      is_alarm: isAlarmPoint // เพิ่ม field นี้เพื่อบอกว่าเป็นจุดที่เกิด alarm
    });
  }

  return result;
};