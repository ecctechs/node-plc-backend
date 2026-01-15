'use strict';

const {
  Device,
  DeviceLog,
  DeviceConnectionLog   // ⭐ ADD
} = require('../../models');

const plcService = require('../services/plc.service');

// เก็บ timer ต่อ device
const timers = new Map();

/**
 * log connection change (เฉพาะตอนสถานะเปลี่ยน)
 */
async function logConnectionChange(device, newStatus) {   // ⭐ ADD
  if (device._lastConnectionStatus === newStatus) return;

  await DeviceConnectionLog.create({
    device_id: device.id,
    status: newStatus
  });

  device._lastConnectionStatus = newStatus;

  console.log(
    `[CONNECTION] ${device.name} → ${newStatus.toUpperCase()}`
  );
}

/**
 * เริ่ม polling สำหรับ device ตัวเดียว
 */
async function startDevicePolling(device) {
  if (timers.has(device.id)) return;

  device._lastConnectionStatus = null;   // ⭐ ADD (in-memory guard)

  const timer = setInterval(async () => {
    const now = new Date();
    let readSuccess = false;

    try {
      const rawValue = await plcService.readValue(device);
      readSuccess = true;

      // แปลง on/off → number
      const value =
        device.data_display_type === 'onoff'
          ? (rawValue ? 1 : 0)
          : rawValue;

      await logConnectionChange(device, 'connected');

      await Device.update(
        {
          last_value: value,
          last_seen_at: now
        },
        { where: { id: device.id } }
      );

      await DeviceLog.create({
        device_id: device.id,
        value,
        created_at: now
      });

      // cache
      device.last_value = value;

    } catch (err) {
      let fallbackValue =
        device.last_value !== null
          ? device.last_value
          : 0; // ⭐ fallback เป็น number เสมอ

      await logConnectionChange(device, 'disconnected');

      await Device.update(
        { last_error_at: now },
        { where: { id: device.id } }
      );

      await DeviceLog.create({
        device_id: device.id,
        value: fallbackValue,
        created_at: now
      });
    }
  }, device.refresh_rate_ms);
  timers.set(device.id, timer);
}

/**
 * หยุด polling device
 */
function stopDevicePolling(deviceId) {
  const timer = timers.get(deviceId);
  if (timer) {
    clearInterval(timer);
    timers.delete(deviceId);
  }
}

/**
 * เริ่ม polling ทุก device ที่ active
 */
async function startPolling() {
  console.log('PLC Polling service started');

  const devices = await Device.findAll({
    where: { is_active: true }
  });

  for (const device of devices) {
    await startDevicePolling(device);
  }
}

/**
 * reload polling (เรียกเมื่อ add/edit/delete device)
 */
async function reloadPolling() {
  console.log('Reload PLC Polling');

  const devices = await Device.findAll({
    where: { is_active: true }
  });

  const activeIds = new Set(devices.map(d => d.id));

  // หยุด device ที่ถูกปิด / ลบ
  for (const id of timers.keys()) {
    if (!activeIds.has(id)) {
      stopDevicePolling(id);
    }
  }

  // เริ่ม device ใหม่
  for (const device of devices) {
    await startDevicePolling(device);
  }
}

module.exports = {
  startPolling,
  reloadPolling,
  stopDevicePolling
};
