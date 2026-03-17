const service = require('../services/device.service');

// GET /api/devices
exports.getDevices = async (req, res) => {
  try {
    const filter = {};
    if (req.query.is_active !== undefined) {
      filter.is_active = req.query.is_active;
    }
    const data = await service.list(filter);
    res.json(data);
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};

// POST /api/devices
exports.createDevice = async (req, res) => {
  try {
    const data = await service.create(req.body);
    res.status(201).json(data);
  } catch (e) {
    res.status(400).json({ message: e.message });
  }
};

// GET /api/devices/:id
exports.getDeviceById = async (req, res) => {
  try {
    const { id } = req.params;
    const device = await service.getById(id);
    res.json({ success: true, data: device });
  } catch (err) {
    res.status(err.status || 500).json({ success: false, message: err.message });
  }
};

// PUT /api/devices/:id
exports.updateDevice = async (req, res) => {
  try {
    const { id } = req.params;
    const device = await service.update(id, req.body);
    res.json({ success: true, data: device });
  } catch (err) {
    res.status(err.status || 500).json({ success: false, message: err.message });
  }
};

// DELETE /api/devices/:id
exports.deleteDevice = async (req, res) => {
  try {
    const { id } = req.params;
    await service.delete(id);
    res.json({ success: true, message: 'ลบอุปกรณ์สำเร็จ' });
  } catch (err) {
    res.status(err.status || 500).json({ success: false, message: err.message });
  }
};

// GET /api/devices/chart?address_id&start&end
exports.getLogsByAddressAndDate = async (req, res) => {
  try {
    const { address_id, start, end } = req.query;

    if (!address_id || !start || !end) {
      return res.status(400).json({ message: 'address_id, start, end are required' });
    }

    const logs = await service.getLogsByAddressAndDate({ address_id, start, end });
    res.json(logs);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// GET /api/devices/chart-by-alarm?address_id&alarm_time&expand
exports.getChartByAlarm = async (req, res) => {
  try {
    const { address_id, alarm_time, expand } = req.query;

    if (!address_id || !alarm_time) {
      return res.status(400).json({ message: 'address_id and alarm_time are required' });
    }

    const data = await service.getChartByAlarm(address_id, alarm_time, expand);
    res.json(data);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Internal server error' });
  }
};
