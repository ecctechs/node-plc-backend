'use strict';

const net = require('net');
const Modbus = require('jsmodbus');
const { DeviceAddress, DeviceLog, Device } = require('./models');
const { processAlarms } = require('./src/services/alarm.service');

const PLC_HOST = '192.168.3.250';
const PLC_PORT = 502;
const MODBUS_UNIT_ID = 0;
const BULK_INSERT_INTERVAL_MS = 2000;
const DEFAULT_REFRESH_RATE_MS = 1000;

const state = {
  isPlcConnected: false,
  pollingIntervals: [],
  socket: null,
  client: null,
  dataBuffer: [],
  lastValuesByAddressId: {}
};

function parsePlcAddress(plcAddress) {
  const numericPart = parseInt(plcAddress.replace(/\D/g, ''), 10);
  const prefix = plcAddress.toUpperCase().replace(/[0-9]/g, '');

  let address = numericPart;
  let isBit = false;

  switch (prefix) {
    case 'M':
      address = 8192 + numericPart;
      isBit = true;
      break;
    case 'SM':
      address = 20480 + numericPart;
      isBit = true;
      break;
    case 'Y':
    case 'X':
      address = numericPart;
      isBit = true;
      break;
    case 'D':
      address = numericPart;
      isBit = false;
      break;
  }

  return { address, isBit };
}

function clearPollingIntervals() {
  state.pollingIntervals.forEach(clearInterval);
  state.pollingIntervals = [];
}

function enqueueDisconnectedLogs(groupItems) {
  const now = new Date();
  groupItems.forEach(item => {
    state.dataBuffer.push({
      address_id: item.id,
      value: state.lastValuesByAddressId[item.id] || 0,
      status: 0,
      created_at: now
    });
  });
}

async function readModbusValue(plcAddr) {
  const { address, isBit } = parsePlcAddress(plcAddr);

  if (isBit) {
    const resp = await state.client.readCoils(address, 1);
    return resp.response._body.values[0] ? 1 : 0;
  }

  const resp = await state.client.readHoldingRegisters(address, 1);
  return resp.response._body.values[0];
}

async function pollGroup(groupItems) {
  if (!state.isPlcConnected || !state.client) {
    enqueueDisconnectedLogs(groupItems);
    return;
  }

  const uniquePlcAddresses = [...new Set(groupItems.map(i => i.plc_address))];
  const roundResults = {};

  try {
    const results = await Promise.all(
      uniquePlcAddresses.map(async (plcAddr) => ({ plcAddr, val: await readModbusValue(plcAddr) }))
    );
    results.forEach(r => { roundResults[r.plcAddr] = r.val; });
  } catch (err) {
    state.isPlcConnected = false;
    console.error('Polling Error:', err.message);
    return;
  }

  const now = new Date();
  groupItems.forEach(item => {
    const val = roundResults[item.plc_address];
    if (val === undefined) return;

    state.lastValuesByAddressId[item.id] = val;
    state.dataBuffer.push({
      address_id: item.id,
      value: val,
      status: 1,
      created_at: now
    });
    processAlarms(item.id, item.device_id, val).catch(() => {});
  });
}

async function startDynamicPolling() {
  clearPollingIntervals();
  console.log('System: Old intervals cleared.');

  try {
    const addresses = await DeviceAddress.findAll({
      include: [{ model: Device, as: 'device' }]
    });

    const groups = addresses.reduce((acc, addr) => {
      const rate = addr.refresh_rate_ms || DEFAULT_REFRESH_RATE_MS;
      acc[rate] = acc[rate] || [];
      acc[rate].push(addr);
      return acc;
    }, {});

    Object.keys(groups).forEach(rate => {
      const groupItems = groups[rate];
      const interval = parseInt(rate, 10);

      const timer = setInterval(() => pollGroup(groupItems), interval);
      state.pollingIntervals.push(timer);
      console.log(`Polling ${interval}ms (${groupItems.length} addresses)`);
    });
  } catch (err) {
    console.error('System Error:', err.message);
  }
}

async function flushBufferToDb() {
  if (!state.dataBuffer.length) return;

  const batch = [...state.dataBuffer];
  state.dataBuffer = [];

  try {
    await DeviceLog.bulkCreate(batch, { logging: false });

    const latest = {};
    batch.forEach(l => { latest[l.address_id] = l; });

    await Promise.all(
      Object.keys(latest).map(id =>
        DeviceAddress.update(
          { last_value: latest[id].value, is_connected: latest[id].status === 1 },
          { where: { id }, logging: false }
        )
      )
    );

    console.log(`DB Write: ${batch.length} records`);
  } catch (err) {
    console.error('DB Error:', err.message);
  }
}

async function reloadPolling() {
  console.log('System: Reloading configuration...');

  if (state.isPlcConnected) {
    await startDynamicPolling();
    return;
  }

  clearPollingIntervals();
  console.log('System: Intervals cleared, waiting for PLC reconnect.');
}

async function readSingleAddress(plcAddr) {
  if (!state.isPlcConnected || !state.client) throw new Error('PLC not connected');

  try {
    return await readModbusValue(plcAddr);
  } catch (err) {
    console.error(`Single Read Error [${plcAddr}]:`, err.message);
    throw err;
  }
}

function startPollWorker() {
  state.socket = new net.Socket();
  state.client = new Modbus.client.TCP(state.socket, MODBUS_UNIT_ID);

  setInterval(flushBufferToDb, BULK_INSERT_INTERVAL_MS);

  const connectPLC = () => {
    console.log('Connecting to PLC', PLC_HOST);
    state.socket.connect({ host: PLC_HOST, port: PLC_PORT });
  };

  state.socket.on('connect', () => {
    state.isPlcConnected = true;
    console.log('PLC Online');
    startDynamicPolling();
  });

  state.socket.on('error', (err) => {
    state.isPlcConnected = false;
    console.error('Socket Error:', err.message);
  });

  state.socket.on('close', () => {
    state.isPlcConnected = false;
    console.log('PLC Offline, reconnect in 5s');
    setTimeout(connectPLC, 5000);
  });

  connectPLC();
}

module.exports = { startPollWorker, reloadPolling, readSingleAddress };

if (require.main === module) {
  startPollWorker();
}
