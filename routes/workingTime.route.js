const express = require('express');
const router = express.Router();
const controller = require('../controllers/workingTime.controller');

router.get('/', controller.getWorkingTime);
router.put('/', controller.updateWorkingTime);

module.exports = router;
