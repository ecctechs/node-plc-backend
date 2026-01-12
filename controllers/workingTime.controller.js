const service = require('../services/workingTime.service');

exports.getWorkingTime = async (req, res) => {
  try {
    // const data = await service.get();
    res.json("data");
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.updateWorkingTime = async (req, res) => {
  try {
    const data = await service.update(req.body);
    res.json(data);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};
