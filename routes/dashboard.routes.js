const express = require('express');
const router = express.Router();
const controller = require('../controllers/dashboard.controller');

// middleware auth ถ้ามี
// const auth = require('../middlewares/auth');

router.get('/cards', controller.getCards);
router.post('/cards', controller.createCard);
router.delete('/cards/:id', controller.deleteCard);
// router.delete('/cards/:id', controller.deleteCard);
// router.patch('/cards/:id/position', controller.updatePosition);

module.exports = router;
