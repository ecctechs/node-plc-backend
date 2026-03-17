const roomService = require('../services/room.service');

exports.getAll = async (req, res) => {
  try {
    const rooms = await roomService.getAll();
    res.json({ success: true, data: rooms });
  } catch (err) {
    console.error(err);
    res.status(err.status || 500).json({ success: false, message: err.message });
  }
};

exports.getById = async (req, res) => {
  try {
    const { id } = req.params;
    const room = await roomService.getById(id);
    res.json({ success: true, data: room });
  } catch (err) {
    console.error(err);
    res.status(err.status || 500).json({ success: false, message: err.message });
  }
};

exports.create = async (req, res) => {
  try {
    const { name } = req.body;

    if (!name) {
      return res.status(400).json({ success: false, message: 'name is required' });
    }

    const room = await roomService.create({ name });

    res.status(201).json({ success: true, data: room });
  } catch (err) {
    console.error(err);
    res.status(err.status || 500).json({ success: false, message: err.message });
  }
};

exports.update = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, is_active } = req.body;

    const room = await roomService.update(id, { name, is_active });

    res.json({ success: true, data: room });
  } catch (err) {
    console.error(err);
    res.status(err.status || 500).json({ success: false, message: err.message });
  }
};

exports.delete = async (req, res) => {
  try {
    const { id } = req.params;
    await roomService.delete(id);
    res.json({ success: true, message: 'Room deleted' });
  } catch (err) {
    console.error(err);
    res.status(err.status || 500).json({ success: false, message: err.message });
  }
};
