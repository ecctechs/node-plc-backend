const express = require('express');
const router = express.Router();
const controller = require('../controllers/device.controller');

router.get('/', controller.getDevices);
router.get('/chart', controller.getLogsByAddressAndDate);
router.get('/chart-by-alarm', controller.getChartByAlarm);
router.get('/:id', controller.getDeviceById);
router.post('/', controller.createDevice);
router.put('/:id', controller.updateDevice);
router.delete('/:id', controller.deleteDevice);

module.exports = router;
