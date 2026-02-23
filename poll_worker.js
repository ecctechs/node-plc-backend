'use strict';
const net = require('net');
const Modbus = require('jsmodbus');
const { DeviceAddress, DeviceLog, Device } = require('./models');
const { processAlarms } = require('./src/services/alarm.service');

const PLC_HOST = '192.168.3.250';
const PLC_PORT = 502;
const BULK_INSERT_INTERVAL = 2000; // DB write interval in ms

const socket = new net.Socket();
const client = new Modbus.client.TCP(socket, 0);

let dataBuffer = [];
let lastValues = {};
let isPlcConnected = false;
let pollingIntervals = [];

// Parse PLC address string to modbus address and bit flag
const parsePlcAddress = (addr) => {
    const numericPart = parseInt(addr.replace(/\D/g, ''));
    const prefix = addr.toUpperCase().replace(/[0-9]/g, '');
    let address = numericPart;
    let isBit = false;

    // MODBUS Device Allocation mapping
    switch (prefix) {
        case 'M':  address = 8192 + numericPart; isBit = true; break;  // offset 8192
        case 'SM': address = 20480 + numericPart; isBit = true; break; // offset 20480
        case 'Y':  address = 0 + numericPart; isBit = true; break;
        case 'X':  address = 0 + numericPart; isBit = true; break;
        case 'D':  address = 0 + numericPart; isBit = false; break;    // Holding Registers
        default:   isBit = ['M', 'Y', 'X', 'SM'].includes(prefix);
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
            if (!acc[rate]) acc[rate] = [];
            acc[rate].push(addr);
            return acc;
        }, {});

        Object.keys(groups).forEach(rate => {
            const groupItems = groups[rate];
            const interval = parseInt(rate);

            const timer = setInterval(async () => {
                if (!isPlcConnected) {
                    // PLC disconnected: log last known value with status=0
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
                    // Read all unique addresses in parallel
                    const results = await Promise.all(uniquePlcAddresses.map(async (plcAddr) => {
                        try {
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
                        } catch (e) {
                            throw e;
                        }
                    }));

                    results.forEach(res => { roundResults[res.plcAddr] = res.val; });
                } catch (err) {
                    isPlcConnected = false;
                    console.error('Polling Error:', err.message);
                    return;
                }

                groupItems.forEach(item => {
                    const finalVal = roundResults[item.plc_address];
                    if (finalVal !== undefined) {
                        lastValues[item.id] = finalVal;
                        dataBuffer.push({
                            address_id: item.id,
                            value: finalVal,
                            status: 1,
                            created_at: new Date()
                        });

                        if (item.id) {
                            processAlarms(item.id, item.device_id, finalVal).catch((err) => {
                                console.error('Alarm Process Error:', err.message);
                            });
                        }
                    }
                });
            }, interval);

            pollingIntervals.push(timer);
            console.log(`Polling: Group ${interval}ms started with ${groupItems.length} addresses`);
        });
    } catch (err) {
        console.error('System Error:', err.message);
    }
}

// Bulk insert to DB
setInterval(async () => {
    if (dataBuffer.length === 0) return;
    const toSave = [...dataBuffer];
    dataBuffer = [];
    try {
        await DeviceLog.bulkCreate(toSave, { logging: false });
        console.log(`DB Write: Saved ${toSave.length} records`);

        const latestStatusMap = {};
        toSave.forEach(log => {
            latestStatusMap[log.address_id] = {
                last_value: log.value,
                is_connected: log.status === 1
            };
        });

        const updateTasks = Object.keys(latestStatusMap).map(id => {
            return DeviceAddress.update(
                { last_value: latestStatusMap[id].last_value, is_connected: latestStatusMap[id].is_connected },
                { where: { id }, logging: false }
            );
        });

        await Promise.all(updateTasks);
    } catch (err) {
        console.error('DB Error:', err.message);
    }
}, BULK_INSERT_INTERVAL);

const connectPLC = () => {
    console.log('Connecting to PLC at', PLC_HOST);
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
    console.log('PLC Offline. Reconnecting in 5s...');
    setTimeout(connectPLC, 5000);
});

connectPLC();
