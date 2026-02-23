const express = require('express');
const router = express.Router();
const controller = require('../controllers/device.controller');
const chartController = require('../controllers/deviceChart.controller');

router.get('/', controller.getDevices);
router.post('/', controller.createDevice);
router.get('/chart', controller.getLogsByAddressAndDate);
router.get('/chart-by-alarm', controller.getChartByAlarm);
router.get('/:id/chart/level', chartController.getLevelChart);

module.exports = router;
