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

exports.getSnapshotHistory = async (req, res) => {
  try {
    const productId = parseInt(req.params.product_id, 10);
    const days      = parseInt(req.query.days, 10) || 7;

    if (isNaN(productId)) {
      return res.status(400).json({ success: false, message: 'product_id ไม่ถูกต้อง' });
    }
    if (days !== 7 && days !== 30) {
      return res.status(400).json({ success: false, message: 'days ต้องเป็น 7 หรือ 30' });
    }

    const data = await oeeService.getSnapshotHistory(productId, days);
    res.json({ success: true, product_id: productId, days, data });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
