const express = require('express');
const router = express.Router();
const controller = require('../controllers/plc.controller');

router.get('/status', controller.status);
router.get('/read', controller.read);
router.post('/write', controller.write);

module.exports = router;