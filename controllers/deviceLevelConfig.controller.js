const service = require('../services/deviceLevelConfig.service');

// POST /api/addresses/:addressId/levels
exports.syncLevels = async (req, res) => {
  try {
    const data = await service.syncLevels(req.params.addressId, req.body);
    res.json(data);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};
