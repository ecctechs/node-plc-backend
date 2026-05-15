const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/oee.controller');

router.post('/snapshot', ctrl.triggerSnapshot);
router.get('/snapshot/:product_id/history', ctrl.getSnapshotHistory);
router.post('/hourly-snapshot', ctrl.triggerHourlySnapshot);
router.get('/hourly-snapshot/:product_id/intraday', ctrl.getIntradayHistory);

module.exports = router;
