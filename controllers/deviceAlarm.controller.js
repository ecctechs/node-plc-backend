'use strict';

const service = require('../services/deviceAlarm.service');

// POST /api/addresses/:addressId/alarms
exports.create = async (req, res) => {
  try {
    const data = await service.createAlarm(req.params.addressId, req.body);
    res.json(data);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// GET /api/events/all?start&end
exports.getHistoryAll = async (req, res) => {
  try {
    const { start, end } = req.query;
    const events = await service.getAllHistory(start, end);
    const formatEvent = (events) => events.map(e => ({
      id: e.id,
      value: e.value,
      event_type: e.event_type,
      created_at: e.created_at,
      rule: e.rule,
      device: e.device,
      address_id: e.address_id
    }));
    res.json(formatEvent(events));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
