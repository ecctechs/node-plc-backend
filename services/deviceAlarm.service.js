'use strict';

const repo = require('../repositories/deviceAlarm.repo');
const addressRepo = require('../repositories/deviceAddress.repo');

/* ===========================================
   ALARM APIs
   Source: src/components/setting/DeviceForm.vue, src/views/AlarmHistory.vue
   =========================================== */

// POST /api/addresses/:addressId/alarms - Create alarms for an address
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

// GET /api/events/all?start={}&end={} - Alarm/history listing
exports.getAllHistory = async (start, end) => {
  return await repo.findAllEvents(start, end);
};
