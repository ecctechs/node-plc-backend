const deviceTypeService = require('../services/deviceType.service');

exports.getAll = async (req, res) => {
  try {
    const deviceTypes = await deviceTypeService.getAll();
    res.json({ success: true, data: deviceTypes });
  } catch (err) {
    console.error(err);
    res.status(err.status || 500).json({ success: false, message: err.message });
  }
};

exports.getById = async (req, res) => {
  try {
    const { id } = req.params;
    const deviceType = await deviceTypeService.getById(id);
    res.json({ success: true, data: deviceType });
  } catch (err) {
    console.error(err);
    res.status(err.status || 500).json({ success: false, message: err.message });
  }
};

exports.create = async (req, res) => {
  try {
    const { name, description, display_types } = req.body;

    if (!name) {
      return res.status(400).json({ success: false, message: 'name is required' });
    }

    const deviceType = await deviceTypeService.create({
      name,
      description,
      display_types,
      is_active: true
    });

    res.status(201).json({ success: true, data: deviceType });
  } catch (err) {
    console.error(err);
    res.status(err.status || 500).json({ success: false, message: err.message });
  }
};

exports.update = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, is_active, display_types } = req.body;

    const deviceType = await deviceTypeService.update(id, {
      name,
      description,
      is_active,
      display_types
    });

    res.json({ success: true, data: deviceType });
  } catch (err) {
    console.error(err);
    res.status(err.status || 500).json({ success: false, message: err.message });
  }
};

exports.delete = async (req, res) => {
  try {
    const { id } = req.params;
    await deviceTypeService.delete(id);
    res.json({ success: true, message: 'Device type deleted' });
  } catch (err) {
    console.error(err);
    res.status(err.status || 500).json({ success: false, message: err.message });
  }
};
