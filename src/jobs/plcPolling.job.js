'use strict';

const { Device, DeviceLog, DeviceConnectionLog } = require('../../models');
const plcService = require('../services/plc.service');
const alarmService = require('../services/alarm.service');

const timers = new Map();
const connectionStates = new Map();

// Log connection status change (only when status changes)
async function logConnectionChange(deviceId, deviceName, newStatus) {
  const lastStatus = connectionStates.get(deviceId);
  if (lastStatus === newStatus) return;

  await DeviceConnectionLog.create({ device_id: deviceId, status: newStatus });
  connectionStates.set(deviceId, newStatus);

  console.log(`[CONNECTION] ${deviceName} → ${newStatus.toUpperCase()}`);
}

// Start polling for a single device
async function startDevicePolling(device) {
  if (timers.has(device.id)) return;

  connectionStates.set(device.id, null);

  const timer = setInterval(async () => {
    const now = new Date();

    try {
      const rawValue = await plcService.readValue(device);
      const value = device.data_display_type === 'onoff' ? (rawValue ? 1 : 0) : rawValue;

      await logConnectionChange(device.id, device.name, 'connected');

      await Device.update({ last_value: value, last_seen_at: now }, { where: { id: device.id } });
      await DeviceLog.create({ device_id: device.id, value, created_at: now });
      await alarmService.processAlarms(device, value);

      device.last_value = value;
    } catch (err) {
      const fallbackValue = device.last_value !== null ? device.last_value : 0;

      await logConnectionChange(device.id, device.name, 'disconnected');
      await Device.update({ last_error_at: now }, { where: { id: device.id } });
      await DeviceLog.create({ device_id: device.id, value: fallbackValue, created_at: now });
    }
  }, device.refresh_rate_ms);

  timers.set(device.id, timer);
}

// Stop polling for a device
function stopDevicePolling(deviceId) {
  const timer = timers.get(deviceId);
  if (timer) {
    clearInterval(timer);
    timers.delete(deviceId);
  }
}

// Start polling all active devices
async function startPolling() {
  console.log('PLC Polling service started');

  const devices = await Device.findAll({ where: { is_active: true } });
  for (const device of devices) {
    await startDevicePolling(device);
  }
}

// Reload polling (call after add/edit/delete device)
async function reloadPolling() {
  // Reserved for future implementation
}

module.exports = { startPolling, reloadPolling, stopDevicePolling };
