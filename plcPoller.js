'use strict';

const net = require('net');
const Modbus = require('jsmodbus');
const { DeviceAddress, DeviceNumberConfig, DeviceLog, Device, ProductLog } = require('./models');
const { processAlarms } = require('./src/services/alarm.service');
const service = require('./services/product.service');
const repo = require('./repositories/product.repo');
const { logEvent: logDowntimeEvent } = require('./services/downtimeLog.service');
const { logEvent: logDowntimeEventProduct } = require('./services/downtimeProduct.service');

const PLC_HOST = '192.168.3.250';
const PLC_PORT = 502;
const MODBUS_UNIT_ID = 0;
const BULK_INSERT_INTERVAL_MS = 2000;
const DEFAULT_REFRESH_RATE_MS = 1000;
const MAX_BUFFER_SIZE = 5000;

const state = {
  isPlcConnected: false,
  pollingIntervals: [],
  socket: null,
  client: null,
  dataBuffer: [],
  lastValuesByAddressId: {},
  productLogBuffer: []
};

// Apply offset, scale, decimal conversion for number/number_gauge types
function applyNumberConfig(value, numberConfig) {
  if (!numberConfig) return value;
  const { scale, offset, decimal_places } = numberConfig;
  const scaledValue = (value * (scale || 1)) + (offset || 0);
  const decimals = decimal_places || 0;
  return Number(scaledValue.toFixed(decimals));
}

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
  getOpertionTime();
  const now = new Date();
  groupItems.forEach(item => {
    const rawVal = roundResults[item.plc_address];
    if (rawVal === undefined) return;

    // Apply number config transformation for number/number_gauge types
    const processedVal = applyNumberConfig(rawVal, item.numberConfig);

    state.lastValuesByAddressId[item.id] = processedVal;
    state.dataBuffer.push({
      address_id: item.id,
      value: processedVal,
      status: 1,
      created_at: now
    });
    processAlarms(item.id, item.device_id, processedVal).catch(() => {});
  });
}

async function startDynamicPolling() {
  clearPollingIntervals();
  console.log('System: Old intervals cleared.');

  try {
    const addresses = await DeviceAddress.findAll({
      include: [
        { model: Device, as: 'device' },
        { model: DeviceNumberConfig, as: 'numberConfig' }
      ]
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
  // Flush device logs buffer
  if (state.dataBuffer.length) {
    // Prevent buffer from growing too large - force flush if too big
    let batch;
    if (state.dataBuffer.length > MAX_BUFFER_SIZE) {
      // Take the last MAX_BUFFER_SIZE items and discard older ones
      batch = state.dataBuffer.slice(-MAX_BUFFER_SIZE);
      state.dataBuffer = [];
      console.warn(`Buffer overflow: discarded ${state.dataBuffer.length - MAX_BUFFER_SIZE} records`);
    } else {
      batch = [...state.dataBuffer];
      state.dataBuffer = [];
    }

    try {
      await DeviceLog.bulkCreate(batch, { logging: false });

      // Group updates by address_id to reduce number of queries
      const latestByAddress = {};
      batch.forEach(l => {
        // Keep the most recent value for each address_id
        latestByAddress[l.address_id] = { value: l.value, is_connected: l.status === 1, created_at: l.created_at };
      });

      // Use Promise.all with individual updates (but limit concurrency)
      const addressIds = Object.keys(latestByAddress);
      const updatePromises = addressIds.map(id =>
        DeviceAddress.update(
          { 
            last_value: latestByAddress[id].value, 
            is_connected: latestByAddress[id].is_connected 
          },
          { where: { id }, logging: false }
        )
      );
      
      await Promise.all(updatePromises);

      console.log(`DB Write: ${batch.length} device log records`);
    } catch (err) {
      console.error('DB Error:', err.message);
      // Put data back to buffer on error for retry
      if (batch.length > 0) {
        state.dataBuffer = [...batch, ...state.dataBuffer];
      }
    }
  }

  // Flush product logs buffer
  if (state.productLogBuffer.length) {
    // Prevent buffer from growing too large - force flush if too big
    let productBatch;
    if (state.productLogBuffer.length > MAX_BUFFER_SIZE) {
      // Take the last MAX_BUFFER_SIZE items and discard older ones
      productBatch = state.productLogBuffer.slice(-MAX_BUFFER_SIZE);
      state.productLogBuffer = [];
      console.warn(`Product buffer overflow: discarded ${state.productLogBuffer.length - MAX_BUFFER_SIZE} records`);
    } else {
      productBatch = [...state.productLogBuffer];
      state.productLogBuffer = [];
    }

    try {
      await ProductLog.bulkCreate(productBatch, { logging: false });
      console.log(`DB Write: ${productBatch.length} product log records`);
    } catch (err) {
      console.error('DB Error:', err.message);
      // Put data back to buffer on error for retry
      if (productBatch.length > 0) {
        state.productLogBuffer = [...productBatch, ...state.productLogBuffer];
      }
    }
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

async function writeModbusValue(plcAddr, value) {
  const { address, isBit } = parsePlcAddress(plcAddr);

  if (isBit) {
    const coilValue = value ? true : false;
    await state.client.writeSingleCoil(address, coilValue);
    return;
  }

  await state.client.writeSingleRegister(address, value);
}

/**
 * Write a value to a single PLC address
 * @param {string} plcAddr - PLC address (e.g., 'D100', 'M10', 'SM0', 'Y0', 'X0')
 * @param {number} value - Value to write
 * @returns {Promise<boolean>} - Returns true if successful
 * @throws {Error} - Throws if PLC not connected or write fails
 * 
 * @example
 * // Write to D register
 * await writeSingleAddress('D100', 123);
 * 
 * // Write to M (bit)
 * await writeSingleAddress('M10', 1);
 * 
 * // Write to SM (special memory bit)
 * await writeSingleAddress('SM0', 0);
 */
async function writeSingleAddress(plcAddr, value) {
  if (!state.isPlcConnected || !state.client) throw new Error('PLC not connected');

  try {
    await writeModbusValue(plcAddr, value);
    console.log(`Write [${plcAddr}] = ${value}`);
    return true;
  } catch (err) {
    console.error(`Single Write Error [${plcAddr}]:`, err.message);
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

let prevComplete = 0;
const { Product } = require('./models');

async function getOpertionTime() {
  try {
    const data = await service.getPlcAddresses();

    const plc_onoff = data.plc_address_output;
    const plc_active = data.plc_address_active;
    const plc_complete = data.plc_address_complete;
     const plc_reject = data.plc_address_reject;

    //  console.log(`PLC Addresses: ON/OFF=${plc_onoff}, ACTIVE=${plc_active}, COMPLETE=${plc_complete}, REJECT=${plc_reject}`);

    // =========================
    // 1. Validate address
    // =========================
    if (
      plc_onoff == null ||
      plc_active == null ||
      plc_complete == null ||
      plc_reject == null
    ) {
      console.error("❌ PLC Address is missing");
      return;
    }

    let plcOnoffValue = 0;
    let runningValue = "";
    let completeValue = 0;
    let rejectValue = 0;

    // =========================
    // 2. Read PLC (แยก try)
    // =========================
    try {
      plcOnoffValue = await readModbusValue(plc_onoff);
      runningValue = await readModbusValue(plc_active);
      completeValue = await readModbusValue(plc_complete);
      rejectValue = await readModbusValue(plc_reject);

            // console.log(`Read PLC: ${plc_onoff}=${plcOnoffValue}, ${plc_active}=${runningValue}, ${plc_complete}=${completeValue}`);
    } catch (err) {
      console.error("❌ PLC Read Error:", err.message);
      return; // หยุดรอบนี้ ไม่ให้ระบบล่ม
    }

    // Find product by ID matching the runningValue from PLC
    // runningValue should be a numeric ID that matches a product in the database
    const productId = parseInt(runningValue, 10);
    
    if (isNaN(productId)) {
      console.error("❌ Invalid product ID from PLC:", runningValue);
      return;
    }

    const product = await repo.findById(productId);
    
    if (!product) {
      console.error("❌ Product not found with ID:", productId);
      return;
    }

    // =========================
    // 3. Store values to product log buffer (like device log)
    // =========================
    const now = new Date();
    
    // Store plc_onoff value
    state.productLogBuffer.push({
      product_id: productId,
      plc_onoff_value: plcOnoffValue,
      plc_active_value: runningValue, // Convert string to 0/1 for consistency
      plc_complete_value: completeValue,
      plc_reject_value: rejectValue,
      created_at: now
    });

    // =========================
    // 4. Downtime Logic
    // =========================
    try {
      if (plcOnoffValue === 0) {
        await logDowntimeEventProduct(productId, 'START', 'rule.name');
      } else {
        await logDowntimeEventProduct(productId, 'END', 'rule.name');
      }
    } catch (err) {
      console.error("❌ Downtime Log Error:", err.message);
    }

    // =========================
    // 5. Total Output Logic
    // =========================
    try {
      if (prevComplete === 0 && completeValue === 1) {
        await Product.increment(
          { total_output: 1 },
          { where: { id: productId } }
        );

        console.log("✅ Output +1");
      }
    } catch (err) {
      console.error("❌ Increment Error:", err.message);
    }

    // =========================
    // 6. Update state
    // =========================
    prevComplete = completeValue;

  } catch (err) {
    console.error("🔥 getOpertionTime ERROR:", err);
  }
}
module.exports = { startPollWorker, reloadPolling, readSingleAddress, writeSingleAddress, isPlcConnected: () => state.isPlcConnected };

if (require.main === module) {
  startPollWorker();
}
