'use strict';

const router = require('express').Router();
const ctrl = require('../controllers/deviceAlarm.controller');

router.post('/addresses/:addressId/alarms', ctrl.create);
router.get('/events/all', ctrl.getHistoryAll);

module.exports = router;
