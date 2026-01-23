'use strict';

const router = require('express').Router();
const ctrl = require('../controllers/deviceAlarm.controller');

router.get('/devices/:deviceId/alarms/events', ctrl.events);
router.post('/devices/:deviceId/alarms', ctrl.create);
router.get('/devices/:deviceId/alarms', ctrl.list);
router.get('/devices/:deviceId/alarms/:alarmId', ctrl.getById);
router.put('/devices/:deviceId/alarms/:alarmId', ctrl.update);
router.delete('/devices/:deviceId/alarms/:alarmId', ctrl.remove);

// router.get('/devices/:deviceId/alarms/events', ctrl.events);
router.patch(
  '/devices/:deviceId/alarms/:alarmId',
  ctrl.toggle
);

module.exports = router;
