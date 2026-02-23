const express = require('express');
const router = express.Router();
const controller = require('../controllers/deviceNumberConfig.controller');

router.post('/addresses/:addressId/number-config', controller.create);

module.exports = router;
