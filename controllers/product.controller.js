const service = require('../services/product.service');
const cloudinary = require('../services/cloudinary.service');
const multer = require('multer');
const path = require('path');
const productLogService = require('../services/productLog.service');

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `${Date.now()}${ext}`);
  }
});

const upload = multer({ storage });

exports.upload = upload;

exports.getProducts = async (req, res) => {
  try {
    const data = await service.list();
    res.json(data);
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};

exports.createProduct = async (req, res) => {
  try {
    let imageUrl = null;

    if (req.file) {
      imageUrl = await cloudinary.uploadImage(req.file);
    }

    const payload = {
      ...req.body,
      image_path: imageUrl || req.body.image_path
    };

    const data = await service.create(payload);
    res.status(201).json(data);
  } catch (e) {
    res.status(400).json({ message: e.message });
  }
};

exports.getProductById = async (req, res) => {
  try {
    const { id } = req.params;
    const product = await service.getById(id);
    res.json({ success: true, data: product });
  } catch (err) {
    res.status(err.status || 500).json({ success: false, message: err.message });
  }
};

exports.updateProduct = async (req, res) => {
  try {
    const { id } = req.params;

    let updateData = { ...req.body };

    if (req.file) {
      const imageUrl = await cloudinary.uploadImage(req.file);
      updateData.image_path = imageUrl;
    }

    const product = await service.update(id, updateData);
    res.json({ success: true, data: product });
  } catch (err) {
    res.status(err.status || 500).json({ success: false, message: err.message });
  }
};

exports.deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;
    await service.delete(id);
    res.json({ success: true, message: 'ลบสินค้าสำเร็จ' });
  } catch (err) {
    res.status(err.status || 500).json({ success: false, message: err.message });
  }
};

exports.updatePlcAddresses = async (req, res) => {
  try {
    const data = await service.updatePlcAddresses(req.body);
    res.json({ success: true, ...data });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

exports.getPlcAddresses = async (req, res) => {
  try {
    const data = await service.getPlcAddresses();
    res.json({ success: true, ...data });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getLatestProductLog = async (req, res) => {
  try {
    const data = await productLogService.getLatest();
    res.json({ success: true, data: data || null });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};