const service = require('../services/interactionLayout.service');

// GET /api/interaction/layouts
exports.getAllLayouts = async (req, res) => {
  try {
    const layouts = await service.getAllLayouts();
    res.json(layouts);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// POST /api/interaction/layouts
exports.createLayout = async (req, res) => {
  try {
    const layout = await service.createLayout(req.body);
    res.status(201).json(layout);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// GET /api/interaction/layouts/:id
exports.getLayoutById = async (req, res) => {
  try {
    const layout = await service.getLayoutById(req.params.id);
    res.json(layout);
  } catch (err) {
    res.status(404).json({ message: err.message });
  }
};

// POST /api/interaction/elements
exports.createElement = async (req, res) => {
  try {
    const element = await service.createElement(req.body);
    res.status(201).json(element);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};
