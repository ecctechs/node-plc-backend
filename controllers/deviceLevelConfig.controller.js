const service = require('../services/deviceLevelConfig.service');

// ดึงรายการ Level ทั้งหมดของจุดอ่านนั้นๆ
exports.listByAddress = async (req, res) => {
  try {
    // ⭐ เปลี่ยนจาก deviceId เป็น addressId
    const data = await service.listByAddress(req.params.addressId);
    res.json(data);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// บันทึก/อัปเดต Level แบบยกชุด (Sync)
exports.syncLevels = async (req, res) => {
  try {
    // ส่ง addressId และ body (ซึ่งควรเป็น Array) ไปให้ service
    const data = await service.syncLevels(req.params.addressId, req.body);
    res.json(data);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// อัปเดตเฉพาะบาง Level (ถ้าต้องการแก้ราย ID)
exports.update = async (req, res) => {
  try {
    const data = await service.update(req.params.id, req.body);
    res.json(data);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// ลบเฉพาะบาง Level (ราย ID)
exports.remove = async (req, res) => {
  try {
    await service.remove(req.params.id);
    res.json({ success: true });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};