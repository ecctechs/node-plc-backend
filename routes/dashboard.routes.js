const express = require('express');
const router = express.Router();
const controller = require('../controllers/dashboard.controller');

router.get('/cards', controller.getCards);
router.post('/cards', controller.createCard);
router.delete('/cards/:id', controller.deleteCard);

module.exports = router;
