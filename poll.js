'use strict';
const net = require('net');
const Modbus = require('jsmodbus');
const { DeviceAddress, DeviceLog, Device } = require('./models');
const { processAlarms } = require('./src/services/alarm.service');

let isPlcConnected = false;
let pollingIntervals = [];
let socket = null;
let client = null;
let dataBuffer = [];
let lastValues = {};

const PLC_HOST = '192.168.3.250';
const PLC_PORT = 502;
const BULK_INSERT_INTERVAL = 2000;

// Parse PLC address string to modbus address and bit flag
const parsePlcAddress = (addr) => {
    const numericPart = parseInt(addr.replace(/\D/g, ''));
    const prefix = addr.toUpperCase().replace(/[0-9]/g, '');
    let address = numericPart;
    let isBit = false;

    switch (prefix) {
        case 'M':  address = 8192 + numericPart; isBit = true; break;
        case 'SM': address = 20480 + numericPart; isBit = true; break;
        case 'Y':
        case 'X':  address = numericPart; isBit = true; break;
        case 'D':  address = numericPart; isBit = false; break;
    }
    return { address, isBit };
};

// Start polling all addresses grouped by refresh rate
async function startDynamicPolling() {
    pollingIntervals.forEach(clearInterval);
    pollingIntervals = [];
    console.log('System: Old intervals cleared.');

    try {
        const addresses = await DeviceAddress.findAll({
            include: [{ model: Device, as: 'device' }]
        });

        const groups = addresses.reduce((acc, addr) => {
            const rate = addr.refresh_rate_ms || 1000;
            acc[rate] = acc[rate] || [];
            acc[rate].push(addr);
            return acc;
        }, {});

        Object.keys(groups).forEach(rate => {
            const groupItems = groups[rate];
            const interval = parseInt(rate);

            const timer = setInterval(async () => {
                if (!isPlcConnected || !client) {
                    groupItems.forEach(item => {
                        dataBuffer.push({
                            address_id: item.id,
                            value: lastValues[item.id] || 0,
                            status: 0,
                            created_at: new Date()
                        });
                    });
                    return;
                }

                const uniquePlcAddresses = [...new Set(groupItems.map(i => i.plc_address))];
                const roundResults = {};

                try {
                    const results = await Promise.all(uniquePlcAddresses.map(async (plcAddr) => {
                        const { address, isBit } = parsePlcAddress(plcAddr);
                        let val;
                        if (isBit) {
                            const resp = await client.readCoils(address, 1);
                            val = resp.response._body.values[0] ? 1 : 0;
                        } else {
                            const resp = await client.readHoldingRegisters(address, 1);
                            val = resp.response._body.values[0];
                        }
                        return { plcAddr, val };
                    }));
                    results.forEach(r => roundResults[r.plcAddr] = r.val);
                } catch (err) {
                    isPlcConnected = false;
                    console.error('Polling Error:', err.message);
                    return;
                }

                groupItems.forEach(item => {
                    const val = roundResults[item.plc_address];
                    if (val === undefined) return;
                    lastValues[item.id] = val;
                    dataBuffer.push({
                        address_id: item.id,
                        value: val,
                        status: 1,
                        created_at: new Date()
                    });
                    processAlarms(item.id, item.device_id, val).catch(() => {});
                });
            }, interval);

            pollingIntervals.push(timer);
            console.log(`Polling ${interval}ms (${groupItems.length} addresses)`);
        });
    } catch (err) {
        console.error('System Error:', err.message);
    }
}

// Reload polling after device config changes
async function reloadPolling() {
    console.log('System: Reloading configuration...');
    if (isPlcConnected) {
        await startDynamicPolling();
    } else {
        pollingIntervals.forEach(clearInterval);
        pollingIntervals = [];
        console.log('System: Intervals cleared, waiting for PLC reconnect.');
    }
}

// Read a single PLC address on demand
async function readSingleAddress(plcAddr) {
    if (!isPlcConnected || !client) throw new Error('PLC not connected');

    const { address, isBit } = parsePlcAddress(plcAddr);

    try {
        if (isBit) {
            const resp = await client.readCoils(address, 1);
            return resp.response._body.values[0] ? 1 : 0;
        } else {
            const resp = await client.readHoldingRegisters(address, 1);
            return resp.response._body.values[0];
        }
    } catch (err) {
        console.error(`Single Read Error [${plcAddr}]:`, err.message);
        throw err;
    }
}

function startPollWorker() {
    socket = new net.Socket();
    client = new Modbus.client.TCP(socket, 0);

    // Bulk insert to DB every BULK_INSERT_INTERVAL ms
    setInterval(async () => {
        if (!dataBuffer.length) return;
        const batch = [...dataBuffer];
        dataBuffer = [];
        try {
            await DeviceLog.bulkCreate(batch, { logging: false });
            const latest = {};
            batch.forEach(l => latest[l.address_id] = l);
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
    }, BULK_INSERT_INTERVAL);

    const connectPLC = () => {
        console.log('Connecting to PLC', PLC_HOST);
        socket.connect({ host: PLC_HOST, port: PLC_PORT });
    };

    socket.on('connect', () => {
        isPlcConnected = true;
        console.log('PLC Online');
        startDynamicPolling();
    });

    socket.on('error', (err) => {
        isPlcConnected = false;
        console.error('Socket Error:', err.message);
    });

    socket.on('close', () => {
        isPlcConnected = false;
        console.log('PLC Offline, reconnect in 5s');
        setTimeout(connectPLC, 5000);
    });

    connectPLC();
}

module.exports = { startPollWorker, reloadPolling, readSingleAddress };

if (require.main === module) {
    startPollWorker();
}
