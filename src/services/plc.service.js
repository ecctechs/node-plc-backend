'use strict';

const net = require('net');
const Modbus = require('jsmodbus');

const PLC_HOST = process.env.PLC_HOST || '192.168.3.250';
const PLC_PORT = process.env.PLC_PORT || 502;
const UNIT_ID  = 0; // ⭐ FX5U ใช้ 0

let socket;
let client;
let isConnected = false;

/* ===============================
 * CONNECT PLC
 * =============================== */
function connectPLC() {
  if (isConnected) return;

  socket = new net.Socket();
  client = new Modbus.client.TCP(socket, UNIT_ID);

  socket.on('connect', () => {
    isConnected = true;
    console.log('[PLC] Connected');
  });

  socket.on('error', (err) => {
    isConnected = false;
    console.error('[PLC] Socket error:', err.message);
  });

  socket.on('close', () => {
    isConnected = false;
    console.warn('[PLC] Connection closed, reconnecting...');
    setTimeout(connectPLC, 3000);
  });

  socket.connect({ host: PLC_HOST, port: PLC_PORT });
}

connectPLC();

/* ===============================
 * PARSE ADDRESS
 * =============================== */
function parseAddress(address) {
  const type = address[0].toUpperCase();
  const index = parseInt(address.slice(1), 10);

  if (Number.isNaN(index)) {
    throw new Error(`Invalid address ${address}`);
  }

  switch (type) {
    case 'M':
      return { type: 'coil', addr: 8192 + index }; // FX5U
    case 'D':
      return { type: 'register', addr: index };
    default:
      throw new Error(`Unsupported address ${address}`);
  }
}

/* ===============================
 * READ ON/OFF (M)
 * =============================== */
exports.readOnOff = async (address) => {
  if (!isConnected) {
    throw new Error('PLC not connected');
  }

  const parsed = parseAddress(address);

  if (parsed.type !== 'coil') {
    throw new Error(`Address ${address} is not ON/OFF type`);
  }

  const resp = await client.readCoils(parsed.addr, 1);
  return resp.response.body.valuesAsArray[0]; // boolean
};

/* ===============================
 * READ NUMBER (D)
 * =============================== */
exports.readNumber = async (address) => {
  if (!isConnected) {
    throw new Error('PLC not connected');
  }

  const parsed = parseAddress(address);

  if (parsed.type !== 'register') {
    throw new Error(`Address ${address} is not NUMBER type`);
  }

  const resp = await client.readHoldingRegisters(parsed.addr, 1);
  return resp.response.body.valuesAsArray[0]; // number (INT16)
};

/* ===============================
 * READ VALUE (AUTO BY TYPE)
 * =============================== */
exports.readValue = async (device) => {
  switch (device.data_display_type) {
    case 'onoff':
      return exports.readOnOff(device.plc_address);

    case 'number':
    case 'number_gauge':
      return exports.readNumber(device.plc_address);

    default:
      throw new Error(
        `Unsupported data_display_type: ${device.data_display_type}`
      );
  }
};
