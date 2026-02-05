'use strict';

const {
  DeviceAlarmRule,
  DeviceAlarmState,
  DeviceAlarmEvent,
  DeviceAddress,
  Device
} = require('../models');
const { Op } = require('sequelize');

/**
 * สร้างกฎการแจ้งเตือนใหม่ 
 * มั่นใจว่าผูกกับ address_id และเก็บ device_id ไว้เพื่อการทำ Report
 */
exports.createRule = async (data) => {
  // รับ data มาตรงๆ โดยใน data ควรมีทั้ง device_id และ address_id จากหน้า UI
  return DeviceAlarmRule.create(data);
};

/**
 * ค้นหากฎทั้งหมดที่ผูกกับ Address (เซนเซอร์) นั้นๆ
 */
exports.findRulesByAddress = (addressId) =>
  DeviceAlarmRule.findAll({
    where: { address_id: addressId },
    include: [
      {
        model: DeviceAddress,
        as: 'address',
        attributes: ['label', 'plc_address']
      }
    ],
    order: [['id', 'ASC']]
  });

/**
 * ค้นหากฎตาม Primary Key
 */
exports.findRuleById = (alarmId) =>
  DeviceAlarmRule.findByPk(alarmId, {
    include: [{ model: DeviceAlarmState, as: 'state' }]
  });

/**
 * อัปเดตกฎการแจ้งเตือน
 */
exports.updateRule = (alarmId, data) =>
  DeviceAlarmRule.update(data, { where: { id: alarmId } });

/**
 * ลบกฎการแจ้งเตือน
 */
exports.deleteRule = (alarmId) =>
  DeviceAlarmRule.destroy({ where: { id: alarmId } });

/* ===== State Management (สถานะปัจจุบัน) ===== */

/**
 * ค้นหาสถานะปัจจุบันของ Alarm ราย Address และ Rule
 */
exports.findState = (addressId, alarmRuleId) =>
  DeviceAlarmState.findOne({
    where: { address_id: addressId, alarm_rule_id: alarmRuleId }
  });

/**
 * บันทึกหรืออัปเดตสถานะ (ใช้อัปเดตตอนค่าเปลี่ยนหรือส่งเมลซ้ำ)
 */
exports.upsertState = (data) =>
  DeviceAlarmState.upsert(data);

/* ===== Event Management (ประวัติการแจ้งเตือน) ===== */

/**
 * บันทึกเหตุการณ์ Trigger หรือ Recover
 */
exports.createEvent = (data) =>
  DeviceAlarmEvent.create(data);

/**
 * ดึงประวัติการแจ้งเตือนทั้งหมดของ Address นั้นๆ
 * พร้อม Join ข้อมูลชื่อ Rule, ชื่อ Address และชื่อ Device
 */
exports.findEventsByAddress = (addressId) =>
  DeviceAlarmEvent.findAll({
    where: { address_id: addressId },
    include: [
      {
        model: DeviceAlarmRule,
        as: 'rule',
        attributes: ['name', 'condition_type', 'min_value', 'max_value', 'severity']
      },
      {
        model: DeviceAddress,
        as: 'address',
        attributes: ['label', 'plc_address'],
        include: [
          {
            model: Device,
            as: 'Device', // ตรวจสอบชื่อ Alias ใน models/index.js (ปกติเป็น 'Device' หรือ 'device')
            attributes: ['name']
          }
        ]
      }
    ],
    attributes: ['id', 'created_at', 'value', 'event_type'],
    order: [['created_at', 'DESC']]
  });

/**
 * ใหม่: ดึงประวัติการแจ้งเตือนทั้งหมดรายเครื่องจักร (Device Level)
 */
exports.findEventsByDevice = (deviceId) =>
  DeviceAlarmEvent.findAll({
    where: { device_id: deviceId },
    include: ['rule', 'address'],
    order: [['created_at', 'DESC']]
  });


// ฟังก์ชันกลางสำหรับตั้งค่าช่วงเวลา Start-End ของวัน
const getDateRange = (startDate, endDate) => {
  const start = new Date(startDate);
  start.setHours(0, 0, 0, 0);
  const end = new Date(endDate);
  end.setHours(23, 59, 59, 999);
  return { [Op.between]: [start, end] };
};

// ดึงทั้งหมด (Global)
exports.findAllEvents = (startDate, endDate) => {
  return DeviceAlarmEvent.findAll({
    where: { created_at: getDateRange(startDate, endDate) },
    include: [
      { 
        model: DeviceAlarmRule, 
        as: 'rule', // ✅ เปลี่ยนจาก 'Rule' เป็น 'rule' ตาม Error message
        attributes: ['name', 'condition_type', 'min_value', 'max_value'] 
      },
      { 
        model: Device, 
        as: 'device', 
        attributes: ['name'] 
      }
    ],
    order: [['created_at', 'DESC']]
  });
};