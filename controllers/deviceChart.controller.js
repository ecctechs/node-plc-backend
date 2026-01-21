const service = require('../services/deviceChart.service');

exports.getOnOffChart = async (req, res) => {
  try {
    const { id } = req.params;
    const { start, end } = req.query;

    if (!start || !end) {
      return res.status(400).json({
        message: 'start and end are required'
      });
    }

    const data = await service.getOnOffChart(
      id,
      new Date(start),
      new Date(end)
    );

    res.json(data);
  } catch (err) {
    console.error('CHART ERROR:', err.message);
    res.status(500).json({ message: 'Cannot load chart data' });
  }
};

exports.getNumberChart = async (req, res) => {
  try {
    const { id } = req.params;
    const { start, end } = req.query;

    const data = await service.getNumberChart(id, start, end);
    res.json(data);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

exports.getLevelChart = async (req, res) => {
  try {

    const { id } = req.params;

    const { start, end, include_raw } = req.query;

    if (!start || !end) {
      return res.status(400).json({ message: 'start and end are required' });
    }

    const data = await service.getLevelChart(
      id,
      new Date(start),
      new Date(end),
      include_raw === 'true'
    );

    res.json(data);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
