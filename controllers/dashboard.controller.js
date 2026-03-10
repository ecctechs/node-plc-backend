const dashboardService = require('../services/dashboard.service');
const { DashboardCard, DeviceAddress, DeviceNumberConfig, DeviceAlarmRule } = require('../models');
const sequelize = require('../models/index').sequelize;

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
    const userId = 1;
    const { address_id, display_type, position } = req.body;

    if (!address_id || !display_type) {
      return res.status(400).json({ message: 'address_id and display_type are required' });
    }

    const address = await DeviceAddress.findByPk(address_id);
    if (!address) {
      return res.status(404).json({ message: 'Address not found' });
    }

    let finalPosition;

    if (position !== undefined && position !== null) {
      // Shift existing cards at or after the given position
      await DashboardCard.update(
        { position: sequelize.literal('position + 1') },
        { where: { user_id: userId, position: { [sequelize.Sequelize.Op.gte]: position } } }
      );
      finalPosition = position;
    } else {
      // Default: append to end
      finalPosition = await DashboardCard.count({ where: { user_id: userId, is_active: true } }) + 1;
    }

    const card = await DashboardCard.create({
      user_id: userId,
      device_id: address.device_id,
      address_id,
      display_type,
      position: finalPosition,
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
    const userId = req.user?.id || 1;

    // Delete the card
    await dashboardService.deleteCard(id, userId);

    // Reindex all active cards
    await dashboardService.reindexAll(userId);

    res.json({ success: true, message: 'Dashboard card deleted' });
  } catch (err) {
    console.error(err);
    res.status(400).json({ success: false, message: err.message });
  }
};

exports.updateCard = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id || 1;
    const { card_id, selectedDeviceId, selectedAddressId, selectedDisplayType, selectedPosition } = req.body;

    // Map frontend field names to backend field names
    const device_id = selectedDeviceId;
    const address_id = selectedAddressId;
    const display_type = selectedDisplayType;
    const position = selectedPosition;

    if (!device_id && !address_id && !display_type && position === undefined && !card_id) {
      return res.status(400).json({ success: false, message: 'At least one field to update is required' });
    }

    const card = await dashboardService.updateCard(id, userId, {
      device_id,
      address_id,
      display_type,
      position
    });

    // Reindex all active cards after update
    await dashboardService.reindexAll(userId);

    res.json({ success: true, data: card });
  } catch (err) {
    console.error(err);
    res.status(err.status || 500).json({ success: false, message: err.message });
  }
};
