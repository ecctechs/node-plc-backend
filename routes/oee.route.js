const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/oee.controller');

router.post('/snapshot', ctrl.triggerSnapshot);

module.exports = router;
