const { DeviceLevelConfig } = require('../models');

// ⭐ เปลี่ยนจาก device_id เป็น address_id
exports.findByAddressId = (addressId) =>
  DeviceLevelConfig.findAll({
    where: { address_id: addressId },
    order: [['level_index', 'ASC']]
  });

exports.create = (data) =>
  DeviceLevelConfig.create(data);

// เพิ่มฟังก์ชันสำหรับลบยกชุด (มีประโยชน์มากตอน Update ข้อมูลใหม่ทั้งหมด)
exports.removeByAddressId = (addressId) =>
  DeviceLevelConfig.destroy({
    where: { address_id: addressId }
  });

exports.update = async (id, data) => {
  const row = await DeviceLevelConfig.findByPk(id);
  if (!row) throw new Error('Level not found');
  return row.update(data);
};

exports.remove = async (id) => {
  const row = await DeviceLevelConfig.findByPk(id);
  if (!row) throw new Error('Level not found');
  await row.destroy();
};