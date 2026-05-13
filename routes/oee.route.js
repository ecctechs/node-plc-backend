const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/oee.controller');

router.post('/snapshot', ctrl.triggerSnapshot);
router.get('/snapshot/:product_id/history', ctrl.getSnapshotHistory);

module.exports = router;
