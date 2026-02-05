const express = require('express');
const router = express.Router();
const controller = require('../controllers/deviceLevelConfig.controller');

router.get(
  '/addresses/:addressId/levels', 
  controller.listByAddress  
);

router.post(
  '/addresses/:addressId/levels', 
  controller.syncLevels     
);

router.put(
  '/levels/:id', 
  controller.update         
);

router.delete(
  '/levels/:id', 
  controller.remove         
);

module.exports = router;