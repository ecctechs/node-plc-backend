const service = require('../services/deviceConnectionChart.service');

exports.getConnectionChart = async (req, res) => {
  try {
    const { id } = req.params;
    const { start, end } = req.query;

    if (!start || !end) {
      return res.status(400).json({
        message: 'start and end are required'
      });
    }

    const data = await service.getConnectionChart(
      id,
      new Date(start),
      new Date(end)
    );

    res.json(data);
  } catch (err) {
    console.error('CONNECTION CHART ERROR:', err.message);
    res.status(500).json({ message: 'Cannot load connection chart' });
  }
};