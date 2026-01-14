'use strict';

const net = require('net');
const Modbus = require('jsmodbus');

const PLC_HOST = process.env.PLC_HOST || '192.168.3.250';
const PLC_PORT = process.env.PLC_PORT || 502;
const UNIT_ID  = 1;

// ===== socket + client =====
let socket;
let client;
let isConnected = false;

// ===== connect PLC =====
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

// เริ่ม connect ทันทีเมื่อโหลดไฟล์
connectPLC();

/**
 * แปลง address string → coil address
 * ตัวอย่าง:
 *  M0  -> 8192
 *  M1  -> 8193
 */
function parseCoilAddress(address) {
  if (!address.startsWith('M')) {
    throw new Error(`Unsupported address ${address}`);
  }
  const index = parseInt(address.slice(1), 10);
  return 8192 + index;
}

/**
 * อ่าน ON/OFF จาก PLC (coil)
 * return boolean
 */
exports.readOnOff = async (address) => {
  if (!isConnected) {
    throw new Error('PLC not connected');
  }

  const coilAddress = parseCoilAddress(address);

  const resp = await client.readCoils(coilAddress, 1);

  // jsmodbus return Buffer
  const value = resp.response.body.valuesAsArray[0];

  return value; // true / false
};
