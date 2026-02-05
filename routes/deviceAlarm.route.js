'use strict';

const router = require('express').Router();
const ctrl = require('../controllers/deviceAlarm.controller');

// ⭐ เปลี่ยนจาก /devices/:deviceId เป็น /addresses/:addressId
// เพื่อให้ Alarm ผูกติดกับจุดอ่านค่า (Address) นั้นๆ โดยตรง

// ดึงประวัติการเกิด Alarm (Events) ของ Address นี้
router.get('/addresses/:addressId/alarms/events', ctrl.events);

// จัดการการตั้งค่าเงื่อนไข (Alarm Rules)
router.post('/addresses/:addressId/alarms', ctrl.create);
router.get('/addresses/:addressId/alarms', ctrl.list);

// การจัดการราย ID (ใช้แค่ alarmId เพราะเป็น Primary Key ของตารางอยู่แล้ว)
router.get('/alarms/:alarmId', ctrl.getById);
router.put('/alarms/:alarmId', ctrl.update);
router.delete('/alarms/:alarmId', ctrl.remove);

// เปิด-ปิด การแจ้งเตือน
router.patch('/alarms/:alarmId/toggle', ctrl.toggle);

router.get('/events/all', ctrl.getHistoryAll);

module.exports = router;