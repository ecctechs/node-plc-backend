const service = require('../services/device.service');

/* ===========================================
   DEVICE APIs
   Source: src/views/AddDashboardCardModal.vue, src/components/setting/DeviceForm.vue
   =========================================== */

// GET /api/devices - List all devices with addresses
exports.getDevices = async (req, res) => {
  try {
    const data = await service.list();
    res.json(data);
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};

// POST /api/devices - Create new device with addresses
exports.createDevice = async (req, res) => {
  try {
    const data = await service.create(req.body);
    res.status(201).json(data);
  } catch (e) {
    res.status(400).json({ message: e.message });
  }
};

/* ===========================================
   CHART APIs
   Source: src/components/chart/NumberChart.vue, NumberGaugeChart.vue, OnOffChart.vue, LevelChart.vue
   =========================================== */

// GET /api/devices/chart?address_id={id}&start={}&end={} - Time-series chart data
exports.getLogsByAddressAndDate = async (req, res) => {
  try {
    const { address_id, start, end } = req.query;

    if (!address_id || !start || !end) {
      return res.status(400).json({
        message: 'address_id, start, end are required'
      });
    }

    const logs = await service.getLogsByAddressAndDate({
      address_id,
      start,
      end
    });

    res.json(logs);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// GET /api/devices/chart-by-alarm?address_id={id}&alarm_time={}&expand={} - Chart data by alarm time
exports.getChartByAlarm = async (req, res) => {
  try {
    const { address_id, alarm_time, expand } = req.query;

    if (!address_id || !alarm_time) {
      return res.status(400).json({
        message: 'address_id และ alarm_time จำเป็นต้องส่งมา'
      });
    }

    const data = await service.getChartByAlarm(
      address_id,
      alarm_time,
      expand
    );

    res.json(data);
  } catch (err) {
    console.error(err);
    res.status(500).json({
      message: 'Internal server error'
    });
  }
};
