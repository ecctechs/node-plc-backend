const plcService = require('../poll');

// GET /api/plc/read?address
exports.read = async (req, res) => {
  try {
    const { address } = req.query;

    if (!address) {
      return res.status(400).json({ message: 'address is required' });
    }

    const value = await plcService.readSingleAddress(address);
    res.json({ value });
  } catch (err) {
    console.error('PLC READ ERROR:', err.message);
    res.status(500).json({ message: 'Read failed' });
  }
};
