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
      // 🔹 อ่าน PLC
      const value = await plcService.readOnOff(device.plc_address);
      readSuccess = true;

      await logConnectionChange(device, 'connected');

      // ✅ อ่านได้ → update last_value + last_seen_at
      await Device.update(
        {
          last_value: value,
          last_seen_at: now
        },
        { where: { id: device.id } }
      );

      // ✅ log ทุก interval
      await DeviceLog.create({
        device_id: device.id,
        value,
        created_at: now
      });

      // update cache ใน memory
      device.last_value = value;

      console.log(
        `[PLC OK] ${device.name} (${device.plc_address}) = ${value}`
      );

    } catch (err) {

      // ===== CONNECTION STATUS CHECK =====
      const timeoutMs = device.refresh_rate_ms * 2;

      const isConnected =
        readSuccess ||
        (
          device.last_seen_at &&
          (now - new Date(device.last_seen_at)) <= timeoutMs
        );

      await logConnectionChange(          // ⭐ ADD
        device,
        isConnected ? 'connected' : 'disconnected'
      );

      // ❌ อ่านไม่ได้ → ใช้ค่าเดิม
      const fallbackValue =
        device.last_value !== null ? device.last_value : false;

      await Device.update(
        {
          last_error_at: now
        },
        { where: { id: device.id } }
      );

      // ❗ ยัง log ตาม interval (ค่าเดิม)
      await DeviceLog.create({
        device_id: device.id,
        value: fallbackValue,
        created_at: now
      });

      console.error(
        `[PLC FAIL] ${device.name} (${device.plc_address}) ` +
        `use last_value=${fallbackValue}`,
        err.message
      );
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
