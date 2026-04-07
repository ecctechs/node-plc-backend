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

// PUT /api/alarms/:alarmId
exports.update = async (req, res) => {
  try {
    const data = await service.updateAlarm(req.params.alarmId, req.body);
    res.json(data);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// DELETE /api/alarms/:alarmId
exports.delete = async (req, res) => {
  try {
    await service.deleteAlarm(req.params.alarmId);
    res.json({ message: 'Alarm deactivated successfully' });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// GET /api/addresses/:addressId/alarms
exports.getByAddressId = async (req, res) => {
  try {
    const data = await service.getByAddressId(req.params.addressId);
    res.json(data);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// GET /api/alarms/:alarmId
exports.getById = async (req, res) => {
  try {
    const data = await service.getById(req.params.alarmId);
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
      room_name: e.device?.room?.name,
      address_id: e.address_id
    }));
    res.json(formatEvent(events));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
