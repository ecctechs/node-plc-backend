const service = require('../services/deviceNumberConfig.service');

/* ===========================================
   NUMBER CONFIG APIs
   Source: src/components/setting/DeviceForm.vue
   =========================================== */

// POST /api/addresses/:addressId/number-config - Save numeric display config
exports.create = async (req, res) => {
  try {
    const data = await service.create(req.params.addressId, req.body);
    res.status(201).json(data);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};
