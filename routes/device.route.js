const express = require('express');
const router = express.Router();
const controller = require('../controllers/device.controller');
const chartController = require('../controllers/deviceChart.controller');

/* ===========================================
   DEVICE MANAGEMENT APIs
   Source: src/components/setting/DeviceForm.vue
   =========================================== */

// GET /api/devices - List all devices with addresses (for AddDashboardCardModal)
router.get('/', controller.getDevices);

// POST /api/devices - Create new device with addresses
router.post('/', controller.createDevice);

/* ===========================================
   CHART APIs
   Source: src/components/chart/NumberChart.vue, NumberGaugeChart.vue, OnOffChart.vue, LevelChart.vue
   =========================================== */

// GET /api/devices/chart?address_id={id}&start={}&end={} - Time-series chart data
router.get('/chart', controller.getLogsByAddressAndDate);

// GET /api/devices/chart-by-alarm?address_id={id}&alarm_time={}&expand={} - Chart data by alarm time
router.get('/chart-by-alarm', controller.getChartByAlarm);

// GET /api/devices/:id/chart/level?start={}&end={} - Level chart data
router.get('/:id/chart/level', chartController.getLevelChart);

module.exports = router;
