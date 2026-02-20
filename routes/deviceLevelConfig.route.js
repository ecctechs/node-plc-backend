const express = require('express');
const router = express.Router();
const controller = require('../controllers/deviceLevelConfig.controller');

/* ===========================================
   LEVEL CONFIG APIs
   Source: src/components/setting/DeviceForm.vue
   =========================================== */

// POST /api/addresses/:addressId/levels - Save level ranges
router.post('/addresses/:addressId/levels', controller.syncLevels);

module.exports = router;
