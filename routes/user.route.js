'use strict';

const express = require('express');
const router = express.Router();
const userController = require('../controllers/user.controller');
const authMiddleware = require('../middleware/auth.middleware');

router.post(
  '/',
  authMiddleware.authenticate,
  authMiddleware.authorizeRoles('super_admin'),
  userController.createUser
);

module.exports = router;
