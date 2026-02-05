'use strict';
const net = require('net');
const Modbus = require('jsmodbus');
const { DeviceAddress, DeviceLog, Device } = require('./models');
const { processAlarms } = require('./src/services/alarm.service');

// --- Configuration ---
const PLC_HOST = '192.168.3.250';
const PLC_PORT = 502;
const BULK_INSERT_INTERVAL = 2000; // บันทึกลง DB ทุก 2 วินาที

const socket = new net.Socket();
const client = new Modbus.client.TCP(socket, 0);

let dataBuffer = [];
let lastValues = {}; 
let isPlcConnected = false;
let pollingIntervals = []; 

const parsePlcAddress = (addr) => {
    const numericPart = parseInt(addr.replace(/\D/g, ''));
    const prefix = addr.toUpperCase().replace(/[0-9]/g, '');

    let address = numericPart;
    let isBit = false;

    // Mapping ตามตาราง MODBUS Device Allocation
    switch (prefix) {
        case 'M':
            address = 8192 + numericPart; // เริ่มที่ 8192
            isBit = true;
            break;
        case 'SM':
            address = 20480 + numericPart; // เริ่มที่ 20480
            isBit = true;
            break;
        case 'Y':
            address = 0 + numericPart; // เริ่มที่ 0
            isBit = true;
            break;
        case 'X':
            address = 0 + numericPart; // ในตารางเป็น Allocation 1 กลุ่ม Coil เช่นกัน
            isBit = true;
            break;
        case 'D':
            address = 0 + numericPart; // Holding Registers เริ่มที่ 0
            isBit = false;
            break;
        default:
            isBit = ['M', 'Y', 'X', 'SM'].includes(prefix);
    }

    return { address, isBit };
};

async function startDynamicPolling() {
    // เคลียร์ Interval เก่าทุกครั้งเพื่อป้องกันข้อมูลซ้ำซ้อน
    pollingIntervals.forEach(clearInterval);
    pollingIntervals = [];
    console.log("🧹 System: Old intervals cleared.");

    try {
        // ดึงข้อมูล Address พร้อม Join Device
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
                    // 🚨 กรณีสายแลนหลุด: บันทึก Last Known Value พร้อม Status 0
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

                // สกัดเฉพาะ Address ที่ไม่ซ้ำ
                const uniquePlcAddresses = [...new Set(groupItems.map(i => i.plc_address))];
                const roundResults = {};

                try {
                    // ✅ แก้ไขหัวใจสำคัญ: อ่าน PLC แบบขนาน (Parallel) เพื่อให้ทันรอบ 200ms
                    const results = await Promise.all(uniquePlcAddresses.map(async (plcAddr) => {
                        try {
                            const { address, isBit } = parsePlcAddress(plcAddr);
                            let val;
                            if (isBit) {
                                const resp = await client.readCoils(address, 1);                              
                                val = resp.response._body.values[0] ? 1 : 0;
                                 console.log(`Reading ${plcAddr} (Addr: ${address}): Value = ${val}`); // เพิ่มบรรทัดนี้
                            } else {
                                const resp = await client.readHoldingRegisters(address, 1);
                                val = resp.response._body.values[0];
                            }
                            return { plcAddr, val };
                        } catch (e) {
                            throw e; // ส่งต่อ error ไปยัง catch ใหญ่
                        }
                    }));

                    // เก็บผลลัพธ์ใส่ Object
                    results.forEach(res => {
                        roundResults[res.plcAddr] = res.val;
                    });

                } catch (err) {
                    isPlcConnected = false;
                    console.error("🔌 Polling Error (Connection lost during read):", err.message);
                    return;
                }

                // กระจายค่าที่อ่านได้ให้แต่ละ ID และใส่ Timestamp แยกกัน
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

                        // ส่งไปเช็ค Alarm (Non-blocking)
                        if (item.id) {
                            processAlarms(item.id, item.device_id, finalVal).catch((err) => {
                                console.error("Alarm Process Error:", err.message);
                            });
                        }
                    }
                });
            }, interval);
            
            pollingIntervals.push(timer);
            console.log(`🚀 Polling: Group ${interval}ms started with ${groupItems.length} addresses`);
        });
    } catch (err) {
        console.error("❌ System Error:", err.message);
    }
}

// --- Database Write Loop (Bulk Insert) ---
setInterval(async () => {
    if (dataBuffer.length === 0) return;
    const toSave = [...dataBuffer];
    dataBuffer = []; 
    try {
        await DeviceLog.bulkCreate(toSave, { logging: false });
        console.log(`📦 DB Write: Saved ${toSave.length} records`);

        const latestStatusMap = {};
        toSave.forEach(log => {
            // เก็บค่าล่าสุดของแต่ละ address_id
            latestStatusMap[log.address_id] = {
                last_value: log.value,
                is_connected: log.status === 1 // ถ้า status ใน log เป็น 1 คือเชื่อมต่อได้
            };
        });

        // รันอัปเดตแบบขนาน
        const updateTasks = Object.keys(latestStatusMap).map(id => {
            return DeviceAddress.update(
                { 
                    last_value: latestStatusMap[id].last_value,
                    is_connected: latestStatusMap[id].is_connected,
                    updated_at:latestStatusMap[id].created_at
                },
                { where: { id: id }, logging: false }
            );
        });
        
        await Promise.all(updateTasks);
    } catch (err) {
        console.error("❌ DB Error:", err.message);
    }
}, BULK_INSERT_INTERVAL);

// --- Connection Management ---
const connectPLC = () => {
    console.log("🔗 Connecting to PLC at", PLC_HOST);
    socket.connect({ host: PLC_HOST, port: PLC_PORT });
};

socket.on('connect', () => {
    isPlcConnected = true;
    console.log("✅ Status: PLC Online");
    startDynamicPolling();
});

socket.on('error', (err) => {
    isPlcConnected = false;
    console.error("🔌 Socket Error:", err.message);
});

socket.on('close', () => {
    isPlcConnected = false;
    console.log("🔌 Status: PLC Offline. Reconnecting in 5s...");
    // ป้องกันการซ้อนของ reconnection
    setTimeout(connectPLC, 5000);
});

// Start Application
connectPLC();