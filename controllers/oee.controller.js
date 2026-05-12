const oeeService = require('../services/oee.service');

exports.triggerSnapshot = async (req, res) => {
  const { date, current_time } = req.body;
  try {
    const results = await oeeService.generateDailyOEE(date, current_time);
    res.json({ success: true, count: results.length, results });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
