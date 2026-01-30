const express = require('express');
const router = express.Router();
const controller = require('../controllers/deviceNumberConfig.controller');

// ⭐ เปลี่ยนจาก /devices/:deviceId เป็น /addresses/:addressId
router.get(
  '/addresses/:addressId/number-config',
  controller.get
);

router.post(
  '/addresses/:addressId/number-config',
  controller.create
);

router.put(
  '/addresses/:addressId/number-config',
  controller.update
);

router.delete(
  '/addresses/:addressId/number-config',
  controller.remove
);

module.exports = router;