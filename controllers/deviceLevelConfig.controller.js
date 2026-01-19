
const service = require('../services/deviceLevelConfig.service');

exports.listByDevice = async (req, res) => {
  try {
    const data = await service.listByDevice(req.params.deviceId);
    res.json(data);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

exports.create = async (req, res) => {
  try {
    const data = await service.create(req.params.deviceId, req.body);
    res.json(data);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

exports.update = async (req, res) => {
  try {
    const data = await service.update(req.params.id, req.body);
    res.json(data);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

exports.remove = async (req, res) => {
  try {
    await service.remove(req.params.id);
    res.json({ success: true });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};
