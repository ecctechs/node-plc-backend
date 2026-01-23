'use strict';

const service = require('../services/deviceAlarm.service');

exports.create = async (req, res) => {
  try {
    const data = await service.createAlarm(
      req.params.deviceId,
      req.body
    );
    res.json(data);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

exports.list = async (req, res) => {
  try {
    const data = await service.listAlarms(req.params.deviceId);
    res.json(data);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

exports.getById = async (req, res) => {
  try {
    const data = await service.getAlarm(
      req.params.deviceId,
      req.params.alarmId
    );
    res.json(data);
  } catch (err) {
    res.status(404).json({ message: err.message });
  }
};

exports.update = async (req, res) => {
  try {
    const data = await service.updateAlarm(
      req.params.deviceId,
      req.params.alarmId,
      req.body
    );
    res.json(data);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

exports.remove = async (req, res) => {
  try {
    const data = await service.deleteAlarm(
      req.params.deviceId,
      req.params.alarmId
    );
    res.json(data);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

exports.events = async (req, res) => {
  try {
    const data = await service.listEvents(req.params.deviceId);
    res.json(data);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

exports.toggle = async (req, res) => {
  try {
    const { is_active } = req.body;

    if (typeof is_active !== 'boolean') {
      return res.status(400).json({
        message: 'is_active must be boolean'
      });
    }

    const data = await service.toggleAlarm(
      req.params.deviceId,
      req.params.alarmId,
      is_active
    );

    res.json(data);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};
