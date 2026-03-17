const express = require('express');
const router = express.Router();
const controller = require('../controllers/deviceLevelConfig.controller');

router.post('/addresses/:addressId/levels', controller.syncLevels);
router.get('/addresses/:addressId/levels', controller.getByAddressId);

module.exports = router;
