'use strict';

const repo = require('../repositories/deviceAlarm.repo');
const addressRepo = require('../repositories/deviceAddress.repo');

// Create alarm rule for an address
exports.createAlarm = async (addressId, payload) => {
  const address = await addressRepo.findById(addressId);
  if (!address) throw new Error('Address not found');

  if (payload.data_type !== address.data_type) {
    throw new Error('data_type does not match address data type');
  }

  return repo.createRule({
    ...payload,
    address_id: addressId,
    device_id: address.device_id
  });
};

// Update alarm rule
exports.updateAlarm = async (alarmId, payload) => {
  const alarm = await repo.findById(alarmId);
  if (!alarm) throw new Error('Alarm rule not found');

  // If address_id is being changed, validate the new address
  if (payload.address_id) {
    const address = await addressRepo.findById(payload.address_id);
    if (!address) throw new Error('Address not found');
    if (payload.data_type && payload.data_type !== address.data_type) {
      throw new Error('data_type does not match address data type');
    }
  } else if (payload.data_type) {
    const address = await addressRepo.findById(alarm.address_id);
    if (payload.data_type !== address.data_type) {
      throw new Error('data_type does not match address data type');
    }
  }

  const [_, [updated]] = await repo.updateRule(alarmId, {
    name: payload.name ?? alarm.name,
    data_type: payload.data_type ?? alarm.data_type,
    condition_type: payload.condition_type ?? alarm.condition_type,
    min_value: payload.min_value !== undefined ? payload.min_value : alarm.min_value,
    max_value: payload.max_value !== undefined ? payload.max_value : alarm.max_value,
    level_index: payload.level_index !== undefined ? payload.level_index : alarm.level_index,
    duration_sec: payload.duration_sec ?? alarm.duration_sec,
    repeat_interval_sec: payload.repeat_interval_sec ?? alarm.repeat_interval_sec,
    severity: payload.severity ?? alarm.severity,
    notify_email: payload.notify_email ?? alarm.notify_email,
    email_recipients: payload.email_recipients ?? alarm.email_recipients,
    is_active: payload.is_active ?? alarm.is_active
  });

  return updated;
};

// Soft delete alarm rule - set is_active to false
exports.deleteAlarm = async (alarmId) => {
  const alarm = await repo.findById(alarmId);
  if (!alarm) throw new Error('Alarm rule not found');

  return repo.deleteRule(alarmId);
};

// Get all alarm rules for an address
exports.getByAddressId = async (addressId) => {
  const address = await addressRepo.findById(addressId);
  if (!address) throw new Error('Address not found');

  return await repo.findByAddressId(addressId);
};

// Get alarm rule by ID
exports.getById = async (alarmId) => {
  const alarm = await repo.findById(alarmId);
  if (!alarm) throw new Error('Alarm rule not found');
  return alarm;
};

// Get all alarm events in date range
exports.getAllHistory = async (start, end) => {
  return await repo.findAllEvents(start, end);
};

const toLocalDate = (d) => {
  const dt = new Date(d);
  return [
    dt.getFullYear(),
    String(dt.getMonth() + 1).padStart(2, '0'),
    String(dt.getDate()).padStart(2, '0')
  ].join('-');
};

const buildDateList = (days) => {
  const localNow = new Date();
  const dates = [];
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(localNow);
    d.setDate(d.getDate() - i);
    dates.push(toLocalDate(d));
  }
  return dates;
};

const aggregateEventsByDay = (events, dates) => {
  const dayMap = {};
  dates.forEach(d => { dayMap[d] = { alarm_count: 0, total_downtime_sec: 0 }; });

  const now = new Date();

  // แยก triggers / recoveries ตาม alarm_rule_id (ตรงกับ frontend ที่ใช้ alarm_rule_id ?? address_id)
  const ruleMap = {};
  events.forEach(e => {
    const key = e.alarm_rule_id;
    if (!ruleMap[key]) ruleMap[key] = { triggers: [], recoveries: [] };
    if (e.event_type === 'TRIGGER')  ruleMap[key].triggers.push(e);
    else if (e.event_type === 'RECOVER') ruleMap[key].recoveries.push(e);
  });

  Object.values(ruleMap).forEach(({ triggers, recoveries }) => {
    triggers.forEach(trg => {
      const date = toLocalDate(trg.created_at);
      if (!dayMap[date]) return;

      dayMap[date].alarm_count++;

      const triggerTime = new Date(trg.created_at);

      // หา RECOVER แรกที่อยู่หลัง trigger (เหมือน frontend)
      const rec = recoveries
        .filter(r => new Date(r.created_at) > triggerTime)
        .sort((a, b) => new Date(a.created_at) - new Date(b.created_at))[0];

      // unresolved → นับถึง now | Math.floor เหมือน frontend duration_sec
      const endTime = rec ? new Date(rec.created_at) : now;
      dayMap[date].total_downtime_sec += Math.floor((endTime - triggerTime) / 1000);
    });
  });

  return dates.map(date => ({
    date,
    total_downtime_sec: dayMap[date].total_downtime_sec,
    alarm_count: dayMap[date].alarm_count
  }));
};

// GET /api/alarms/events/history?days — รวมทุก device
exports.getAlarmEventHistory = async (days) => {
  const dates = buildDateList(days);
  const events = await repo.findEventsInRange(dates[0], dates[dates.length - 1]);
  return aggregateEventsByDay(events, dates);
};

// GET /api/alarms/events/:device_id/history?days — แยกตาม device
exports.getAlarmEventHistoryByDevice = async (deviceId, days) => {
  const dates = buildDateList(days);
  const events = await repo.findEventsByDeviceId(deviceId, dates[0], dates[dates.length - 1]);
  return aggregateEventsByDay(events, dates);
};
