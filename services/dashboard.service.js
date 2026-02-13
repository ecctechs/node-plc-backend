const dashboardRepo = require('../repositories/dashboard.repository');

exports.getCards = async () => {
  const cards = await dashboardRepo.findAll();

  return cards.map(card => {
    const addr = card.address;

    return {
      // 🔥 DashboardCard fields
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
  if (exists) {
    throw { status: 409, message: 'Card already exists' };
  }

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

  if (!card) {
    throw new Error('Dashboard card not found');
  }

  // 🔒 กันลบข้าม user
  if (card.user_id !== userId) {
    throw new Error('Permission denied');
  }

  // ✅ soft delete (แนะนำ)
  await dashboardRepo.softDelete(cardId);

  // ❌ หรือ hard delete (ถ้าต้องการ)
  // await dashboardRepo.hardDelete(cardId);
};