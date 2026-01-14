const express = require('express');
const router = express.Router();
const controller = require('../controllers/device.controller');
const chartController = require('../controllers/deviceChart.controller');
const connectionChartController =
  require('../controllers/deviceConnectionChart.controller');

router.get(
  '/:id/chart/connection',
  connectionChartController.getConnectionChart
);
router.get('/status', controller.getDeviceStatus);
router.get('/:id/chart/onoff', chartController.getOnOffChart);
router.get('/', controller.getDevices);
router.get('/:id', controller.getDeviceById);
router.post('/', controller.createDevice);
router.put('/:id', controller.updateDevice);
router.delete('/:id', controller.deleteDevice);

module.exports = router;
