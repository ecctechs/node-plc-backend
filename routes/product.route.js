const express = require('express');
const router = express.Router();
const controller = require('../controllers/product.controller');

router.put('/plc-addresses', controller.updatePlcAddresses);
router.get('/plc-addresses', controller.getPlcAddresses);

router.get('/', controller.getProducts);
router.post('/', controller.upload.single('image'), controller.createProduct);
router.get('/:id', controller.getProductById);
router.put('/:id', controller.upload.single('image'), controller.updateProduct);
router.delete('/:id', controller.deleteProduct);

module.exports = router;