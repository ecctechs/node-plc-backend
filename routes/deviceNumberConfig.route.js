const express = require('express');
const router = express.Router();
const controller = require('../controllers/deviceNumberConfig.controller');

/* ===========================================
   NUMBER CONFIG APIs
   Source: src/components/setting/DeviceForm.vue
   =========================================== */

// POST /api/addresses/:addressId/number-config - Save numeric display config
router.post('/addresses/:addressId/number-config', controller.create);

module.exports = router;
