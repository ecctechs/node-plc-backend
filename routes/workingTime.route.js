const express = require('express');
const router = express.Router();
const controller = require('../controllers/workingTime.controller');

router.get('/', controller.getWorkingTime);
router.put('/', controller.updateWorkingTime);
router.get('/planned-production', controller.getPlannedProductionTime);
router.get('/planned-production/range', controller.getPlannedProductionTimeRange);

module.exports = router;
