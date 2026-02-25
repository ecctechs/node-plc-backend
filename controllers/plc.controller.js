const plcService = require('../plcPoller');

// GET /api/plc/status
exports.status = async (req, res) => {
  res.json({ connected: plcService.isPlcConnected() });
};

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

// POST /api/plc/write
exports.write = async (req, res) => {
  try {
    const { address, value } = req.body;

    if (!address) {
      return res.status(400).json({ message: 'address is required' });
    }

    if (value === undefined) {
      return res.status(400).json({ message: 'value is required' });
    }

    await plcService.writeSingleAddress(address, Number(value));
    res.json({ success: true, address, value });
  } catch (err) {
    console.error('PLC WRITE ERROR:', err.message);
    res.status(500).json({ message: err.message || 'Write failed' });
  }
};
