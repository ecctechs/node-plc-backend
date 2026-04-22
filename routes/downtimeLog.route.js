const express = require('express');
const router = express.Router();
const controller = require('../controllers/downtimeLog.controller');

router.get('/:deviceId', controller.getDowntimeSummary);
router.post('/:deviceId/events', controller.logDowntimeEvent);

module.exports = router;