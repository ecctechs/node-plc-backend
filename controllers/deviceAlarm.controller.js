'use strict';

const service = require('../services/deviceAlarm.service');

exports.create = async (req, res) => {
  try {
    // ⭐ เปลี่ยนจาก deviceId เป็น addressId
    const data = await service.createAlarm(
      req.params.addressId,
      req.body
    );
    res.json(data);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

exports.list = async (req, res) => {
  try {
    // ⭐ เปลี่ยนจาก deviceId เป็น addressId
    const data = await service.listAlarms(req.params.addressId);
    res.json(data);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

exports.getById = async (req, res) => {
  try {
    // สำหรับราย ID เราใช้แค่ alarmId ก็เพียงพอ (ตาม Routes ใหม่)
    const data = await service.getAlarm(req.params.alarmId);
    res.json(data);
  } catch (err) {
    res.status(404).json({ message: err.message });
  }
};

exports.update = async (req, res) => {
  try {
    const data = await service.updateAlarm(
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
    const data = await service.deleteAlarm(req.params.alarmId);
    res.json(data);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

exports.events = async (req, res) => {
  try {
    // ⭐ เปลี่ยนจาก deviceId เป็น addressId เพื่อดึง event ของจุดอ่านนั้น
    const data = await service.listEvents(req.params.addressId);
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
      req.params.alarmId,
      is_active
    );

    res.json(data);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

exports.getHistoryAll = async (req, res) => {
  try {
    const { start, end } = req.query;
    const events = await service.getAllHistory(start, end);
    const formatEvent = (events) => events.map(e => ({
      id: e.id,
      value: e.value,
      event_type: e.event_type,
      created_at: e.created_at,
      rule: e.rule,    // ✅ เปลี่ยนจาก e.Rule เป็น e.rule
      device: e.device // ⚠️ ถ้าแก้ Device เป็นตัวเล็ก ก็ต้องแก้ตรงนี้เป็น e.device
    }));
    res.json(formatEvent(events));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};