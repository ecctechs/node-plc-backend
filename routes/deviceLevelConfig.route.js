const express = require('express');
const router = express.Router();
const controller = require('../controllers/deviceLevelConfig.controller');

router.get('/devices/:deviceId/levels', controller.listByDevice);
router.post('/devices/:deviceId/levels', controller.create);
router.put('/levels/:id', controller.update);
router.delete('/levels/:id', controller.remove);

module.exports = router;