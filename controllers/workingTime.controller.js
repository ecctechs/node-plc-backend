const service = require('../services/workingTime.service');

exports.getWorkingTime = async (req, res) => {
  try {
    const data = await service.get();
    res.json(data);
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

exports.getPlannedProductionTime = async (req, res) => {
  try {
    const { date, current_time } = req.query;
    const result = await service.getPlannedProductionTime(date, current_time);
    res.json(result);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getPlannedProductionTimeRange = async (req, res) => {
  try {
    const { start, end } = req.query;

    if (!start || !end) {
      return res.status(400).json({ message: 'start and end dates are required' });
    }

    const result = await service.getPlannedProductionTimeRange(start, end);
    res.json(result);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getCurrentPlannedTime = async (req, res) => {
  try {
    const now = new Date();
    const dateStr = now.toISOString().split('T')[0];
    const currentTimeStr = now.toTimeString().slice(0, 5); // HH:MM format

    const result = await service.getPlannedProductionTime(dateStr, currentTimeStr);
    res.json({
      Planned_Time: result.breakdown.elapsed_minutes
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
