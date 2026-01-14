const express = require('express');
const router = express.Router();
const controller = require('../controllers/deviceNumberConfig.controller');

router.get(
  '/devices/:deviceId/number-config',
  controller.get
);

router.post(
  '/devices/:deviceId/number-config',
  controller.create
);

router.put(
  '/devices/:deviceId/number-config',
  controller.update
);

router.delete(
  '/devices/:deviceId/number-config',
  controller.remove
);

module.exports = router;
