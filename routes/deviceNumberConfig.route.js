const express = require('express');
const router = express.Router();
const controller = require('../controllers/deviceNumberConfig.controller');

router.post('/addresses/:addressId/number-config', controller.create);
router.put('/addresses/:addressId/number-config', controller.update);
router.get('/addresses/:addressId/number-config', controller.getByAddressId);

module.exports = router;
