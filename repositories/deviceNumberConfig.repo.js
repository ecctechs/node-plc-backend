const { DeviceNumberConfig } = require('../models');

// ⭐ เปลี่ยนจาก device_id เป็น address_id
exports.findByAddressId = (addressId) =>
  DeviceNumberConfig.findOne({ where: { address_id: addressId } });

exports.create = (data) =>
  DeviceNumberConfig.create(data);

// ⭐ ค้นหาและอัปเดตผ่าน address_id
exports.updateByAddressId = (addressId, data) =>
  DeviceNumberConfig.update(data, {
    where: { address_id: addressId }
  });

// ⭐ ค้นหาและลบผ่าน address_id
exports.removeByAddressId = (addressId) =>
  DeviceNumberConfig.destroy({
    where: { address_id: addressId }
  });