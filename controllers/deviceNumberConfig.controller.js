const service = require('../services/deviceNumberConfig.service');

exports.get = async (req, res) => {
  try {
    // ⭐ เปลี่ยนจาก deviceId เป็น addressId
    const data = await service.get(req.params.addressId);
    res.json(data);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

exports.create = async (req, res) => {
  try {
    // ⭐ เปลี่ยนจาก deviceId เป็น addressId
    const data = await service.create(req.params.addressId, req.body);
    res.status(201).json(data);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

exports.update = async (req, res) => {
  try {
    const data = await service.update(req.params.addressId, req.body);
    res.json(data);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

exports.remove = async (req, res) => {
  try {
    await service.remove(req.params.addressId);
    res.json({ success: true });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};