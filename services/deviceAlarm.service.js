'use strict';

const repo = require('../repositories/deviceAlarm.repo');
const addressRepo = require('../repositories/deviceAddress.repo'); // เพิ่มการดึง Address Repo

exports.createAlarm = async (addressId, payload) => {
  // 1. เช็คว่า Address นี้มีจริงไหม
  const address = await addressRepo.findById(addressId);
  if (!address) throw new Error('Address not found');

  // 2. เช็คความถูกต้องของ data_type (Validation)
  if (payload.data_type !== address.data_type) {
    throw new Error('data_type does not match address data type');
  }

  // ✅ 3. ดึง device_id จากตัวแปร address ที่ find มาได้เลย 
  // วิธีนี้จะแม่นยำที่สุด เพราะเป็นการยืนยันว่า Rule นี้ผูกกับ Device ที่เป็นเจ้าของ Address นี้จริงๆ
  return repo.createRule({
    ...payload,
    address_id: addressId,
    device_id: address.device_id // ดึงจากก้อนข้อมูล address
  });
};

exports.listAlarms = (addressId) =>
  repo.findRulesByAddress(addressId); // เปลี่ยนชื่อฟังก์ชันใน repo ให้สื่อความหมาย

exports.getAlarm = async (alarmId) => {
  // ตัด addressId ออกจากการค้นหาเพราะ alarmId เป็น PK ที่ระบุแถวได้เลย
  const rule = await repo.findRuleById(alarmId);
  if (!rule) throw new Error('Alarm not found');
  return rule;
};

exports.updateAlarm = async (alarmId, payload) => {
  const rule = await repo.findRuleById(alarmId);
  if (!rule) throw new Error('Alarm not found');

  await repo.updateRule(alarmId, payload);
  return { message: 'Alarm updated' };
};

exports.deleteAlarm = async (alarmId) => {
  const rule = await repo.findRuleById(alarmId);
  if (!rule) throw new Error('Alarm not found');

  await repo.deleteRule(alarmId);
  return { message: 'Alarm deleted' };
};

exports.toggleAlarm = async (alarmId, isActive) => {
  const rule = await repo.findRuleById(alarmId);
  if (!rule) throw new Error('Alarm not found');

  await repo.updateRule(alarmId, { is_active: isActive });

  return {
    message: isActive ? 'Alarm enabled' : 'Alarm disabled'
  };
};

exports.getAllHistory = async (start, end) => {
  return await repo.findAllEvents(start, end);
};

exports.listEvents = (addressId) =>
  repo.findEventsByAddress(addressId); // เปลี่ยนชื่อฟังก์ชันใน repo