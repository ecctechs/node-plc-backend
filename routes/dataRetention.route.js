'use strict';

const express = require('express');
const router = express.Router();
const controller = require('../controllers/dataRetention.controller');

// DELETE /api/data-retention/clean
router.delete('/clean', controller.cleanOldLogs);

module.exports = router;
