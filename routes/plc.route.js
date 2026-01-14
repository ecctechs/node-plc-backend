const express = require('express');
const router = express.Router();
const controller = require('../controllers/plc.controller');

router.get('/read', controller.read);

module.exports = router;