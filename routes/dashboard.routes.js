const express = require('express');
const router = express.Router();
const controller = require('../controllers/dashboard.controller');

router.get('/cards', controller.getCards);
router.post('/cards', controller.createCard);
router.put('/cards/:id', controller.updateCard);
router.delete('/cards/:id', controller.deleteCard);

module.exports = router;
