const dashboardService = require('../services/dashboard.service');
const {
  DashboardCard,
  DeviceAddress,
  Device,
  DeviceNumberConfig,
  DeviceAlarmRule
} = require('../models');

exports.getCards = async (req, res) => {
  try {
    const cards = await dashboardService.getCards();
    res.json(cards);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.createCard = async (req, res) => {
  try {
    const userId = 1; // หรือ mock = 1
    const { address_id, display_type } = req.body;

    if (!address_id || !display_type) {
      return res.status(400).json({
        message: 'address_id and display_type are required'
      });
    }

    // ⭐ 1. หา address เพื่อเอา device_id
    const address = await DeviceAddress.findByPk(address_id);

    if (!address) {
      return res.status(404).json({ message: 'Address not found' });
    }

    // ⭐ 2. กันซ้ำ
    // const exists = await DashboardCard.findOne({
    //   where: {
    //     user_id: userId,
    //     address_id
    //   }
    // });

    // if (exists) {
    //   return res.status(409).json({ message: 'Card already exists' });
    // }

    // ⭐ 3. create โดยใส่ device_id ให้ครบ
    const card = await DashboardCard.create({
      user_id: userId,
      device_id: address.device_id, // ✅ FIX HERE
      address_id,
      display_type,
      position: await DashboardCard.count({ where: { user_id: userId } }) + 1,
      is_active: true
    });

    res.status(201).json(card);

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
};

exports.deleteCard = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id || 1; // 🔴 ปรับตาม auth ของคุณ

    await dashboardService.deleteCard(id, userId);

    res.json({
      success: true,
      message: 'Dashboard card deleted'
    });
  } catch (err) {
    console.error(err);
    res.status(400).json({
      success: false,
      message: err.message
    });
  }
};
