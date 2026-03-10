const dashboardRepo = require('../repositories/dashboard.repository');
const { DeviceAddress } = require('../models');

exports.getCards = async () => {
  const cards = await dashboardRepo.findAll();

  return cards.map(card => {
    const addr = card.address;

    return {
      card_id: card.id,
      position: card.position,
      is_active: card.is_active,
      display_type: card.display_type,

      address_id: addr.id,
      device: {
        id: addr.device.id,
        name: addr.device.name,
        type: addr.device.device_type
      },
      label: addr.label,
      plc_address: addr.plc_address,
      data_type: addr.data_type,
      is_connected: addr.is_connected,
      last_value: addr.last_value,
      refresh_rate_ms: addr.refresh_rate_ms,
      updated_at: addr.updated_at,

      numberConfig: addr.numberConfig || null,
      levelConfigs: addr.levels || [],

      alarm_count: addr.alarms?.length || 0,
      alarms: addr.alarms.map(a => ({
        type: a.condition_type,
        min: a.min_value,
        max: a.max_value,
        severity: a.severity
      })),

      expand: false
    };
  });
};

exports.createCard = async (userId, payload) => {
  const { address_id, display_type } = payload;

  if (!address_id || !display_type) {
    throw { status: 400, message: 'address_id and display_type are required' };
  }

  const exists = await dashboardRepo.findByUserAndAddress(userId, address_id);
  if (exists) throw { status: 409, message: 'Card already exists' };

  const nextPos = await dashboardRepo.getNextPosition(userId);

  return await dashboardRepo.create({
    user_id: userId,
    address_id,
    display_type,
    position: nextPos,
    is_active: true
  });
};

exports.deleteCard = async (cardId, userId) => {
  const card = await dashboardRepo.findById(cardId);

  if (!card) throw new Error('Dashboard card not found');

  // Prevent cross-user deletion
  if (card.user_id !== userId) throw new Error('Permission denied');

  await dashboardRepo.softDelete(cardId);
};

exports.reindexAll = async (userId) => {
  return await dashboardRepo.reindexAll(userId);
};

exports.updateCard = async (cardId, userId, payload) => {
  const { device_id, address_id, display_type, position } = payload;

  const card = await dashboardRepo.findById(cardId);
  if (!card) throw { status: 404, message: 'Dashboard card not found' };

  // Prevent cross-user update
  if (card.user_id !== userId) throw { status: 403, message: 'Permission denied' };

  // Validate address_id if provided
  if (address_id) {
    const address = await DeviceAddress.findByPk(address_id);
    if (!address) throw { status: 404, message: 'Address not found' };
  }

  const updateData = {};
  if (device_id !== undefined) updateData.device_id = device_id;
  if (address_id !== undefined) updateData.address_id = address_id;
  if (display_type !== undefined) updateData.display_type = display_type;
  if (position !== undefined) updateData.position = position;

  await dashboardRepo.update(cardId, updateData);

  return await dashboardRepo.findById(cardId);
};
