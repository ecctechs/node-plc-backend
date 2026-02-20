'use strict';

const router = require('express').Router();
const ctrl = require('../controllers/deviceAlarm.controller');

/* ===========================================
   ALARM APIs
   Source: src/components/setting/DeviceForm.vue, src/views/AlarmHistory.vue
   =========================================== */

// POST /api/addresses/:addressId/alarms - Create alarms for an address
router.post('/addresses/:addressId/alarms', ctrl.create);

// GET /api/events/all?start={}&end={} - Alarm/history listing
router.get('/events/all', ctrl.getHistoryAll);

module.exports = router;
