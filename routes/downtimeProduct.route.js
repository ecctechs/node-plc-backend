const express = require('express');
const router = express.Router();
const controller = require('../controllers/downtimeProduct.controller');

router.get('/:productId', controller.getDowntimeSummary);
router.post('/:productId/events', controller.logDowntimeEvent);

module.exports = router;