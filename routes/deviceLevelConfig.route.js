const express = require('express');
const router = express.Router();
const controller = require('../controllers/deviceLevelConfig.controller');

router.post('/addresses/:addressId/levels', controller.syncLevels);

module.exports = router;
