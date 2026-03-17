const service = require('../services/deviceNumberConfig.service');

// POST /api/addresses/:addressId/number-config
exports.create = async (req, res) => {
  try {
    const data = await service.create(req.params.addressId, req.body);
    res.status(201).json(data);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// PUT /api/addresses/:addressId/number-config
exports.update = async (req, res) => {
  try {
    const data = await service.update(req.params.addressId, req.body);
    res.json(data);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// GET /api/addresses/:addressId/number-config
exports.getByAddressId = async (req, res) => {
  try {
    const data = await service.getByAddressId(req.params.addressId);
    if (!data) return res.status(404).json({ message: 'Number config not found' });
    res.json(data);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};
