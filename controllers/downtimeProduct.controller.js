const service = require('../services/downtimeProduct.service');

exports.getDowntimeSummary = async (req, res) => {
  try {
    const { productId } = req.params;
    const { start, end } = req.query;

    if (!productId || !start || !end) {
      return res.status(400).json({
        message: 'productId, start, end are required'
      });
    }

    const result = await service.getDowntimeSummary(
      parseInt(productId),
      new Date(start),
      new Date(end)
    );

    res.json(result);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.logDowntimeEvent = async (req, res) => {
  try {
    const { productId } = req.params;
    const { event_type, reason } = req.body;

    if (!event_type || !['START', 'END'].includes(event_type)) {
      return res.status(400).json({
        message: 'event_type is required and must be START or END'
      });
    }

    const result = await service.logEvent(parseInt(productId), event_type, reason);
    res.status(201).json(result);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};