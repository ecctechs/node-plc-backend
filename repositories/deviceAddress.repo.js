const { DeviceAddress } = require('../models');

// หา Address ตาม ID (ใช้บ่อยใน Service ของ Config)
exports.findById = (id) => 
  DeviceAddress.findByPk(id);

// หา Address ทั้งหมดของ Device เครื่องนั้นๆ
exports.findByDeviceId = (deviceId) => 
  DeviceAddress.findAll({ 
    where: { device_id: deviceId },
    order: [['id', 'ASC']]
  });

// สร้าง Address ใหม่
exports.create = (data) => 
  DeviceAddress.create(data);

// อัปเดตข้อมูล Address (เช่น แก้ไข plc_address หรือ label)
exports.update = (id, data) => 
  DeviceAddress.update(data, { 
    where: { id } 
  });

// ลบ Address
exports.remove = (id) => 
  DeviceAddress.destroy({ 
    where: { id } 
  });