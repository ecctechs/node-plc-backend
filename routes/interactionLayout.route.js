const express = require('express');
const router = express.Router();
const controller = require('../controllers/interactionLayout.controller');

router.get('/layouts', controller.getAllLayouts);
router.post('/layouts', controller.createLayout);
router.get('/layouts/:id', controller.getLayoutById);

router.post('/elements', controller.createElement);

module.exports = router;
