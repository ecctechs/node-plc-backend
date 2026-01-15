const service = require('../services/device.service');

exports.getDevices = async (req, res) => {
  try {
    const data = await service.list();
    res.json(data);
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};

exports.getDeviceById = async (req, res) => {
  try {
    const data = await service.getById(req.params.id);
    if (!data) return res.status(404).json({ message: 'Not found' });
    res.json(data);
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};

exports.createDevice = async (req, res) => {
  try {
    const data = await service.create(req.body);
    res.status(201).json(data);
  } catch (e) {
    res.status(400).json({ message: e.message });
  }
};

exports.updateDevice = async (req, res) => {
  try {
    const data = await service.update(req.params.id, req.body);
    res.json(data);
  } catch (e) {
    res.status(400).json({ message: e.message });
  }
};

exports.deleteDevice = async (req, res) => {
  try {
    await service.remove(req.params.id);
    res.json({ success: true });
  } catch (e) {
    res.status(400).json({ message: e.message });
  }
};

exports.getDeviceStatus = async (req, res) => {
  try {
    const data = await service.getStatusList();
    res.json(data);
  } catch (err) {
    console.error('GET STATUS ERROR:', err.message);
    res.status(500).json({ message: 'Cannot load device status' });
  }
};
