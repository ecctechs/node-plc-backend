const service = require('../services/deviceLog.service');

exports.getDeviceLogs = async (req, res) => {
  try {
    const data = await service.getLogs(req.query);
    res.json(data);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
