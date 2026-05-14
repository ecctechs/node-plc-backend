'use strict';

const router = require('express').Router();
const ctrl = require('../controllers/deviceAlarm.controller');

router.post('/addresses/:addressId/alarms', ctrl.create);
router.put('/alarms/:alarmId', ctrl.update);
router.delete('/alarms/:alarmId', ctrl.delete);
router.get('/addresses/:addressId/alarms', ctrl.getByAddressId);
router.get('/alarms/:alarmId', ctrl.getById);
router.get('/alarms/events/history', ctrl.getAlarmEventHistory);
router.get('/alarms/events/:device_id/history', ctrl.getAlarmEventHistoryByDevice);
router.get('/events/all', ctrl.getHistoryAll);

module.exports = router;
