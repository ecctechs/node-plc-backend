const express = require('express');
const router = express.Router();
const controller = require('../controllers/deviceLog.controller');

router.get('/', controller.getDeviceLogs);

module.exports = router;
