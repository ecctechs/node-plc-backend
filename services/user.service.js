'use strict';

const userRepo = require('../repositories/user.repository');
const userRoomService = require('./userRoom.service');
const { User, UserRoom } = require('../models');

exports.findByEmail = (email) => {
  return userRepo.findByEmail(email);
};

exports.findById = (id) => {
  return userRepo.findById(id);
};

exports.create = (data) => {
  return userRepo.create(data);
};

exports.createWithRoomAssignment = async (userData, roomAssignments) => {
  const transaction = await User.sequelize.transaction();

  try {
    console.log('🔄 Starting user creation with rooms:', { email: userData.email, roomCount: roomAssignments.length });
    
    // Create the user within the transaction
    const user = await User.create(userData, { transaction });
    console.log('✅ User created:', { id: user.id, email: user.email });

    // If room assignments are provided, bulk create them within the same transaction
    if (roomAssignments && Array.isArray(roomAssignments) && roomAssignments.length > 0) {
      const roomData = roomAssignments.map(room => ({
        user_id: user.id,
        room_id: room.room_id,
        scope: room.scope || 'view',
        assigned_by: userData.created_by || null
      }));
      console.log('🔄 Creating user_rooms:', roomData);
      await UserRoom.bulkCreate(roomData, { transaction });
      console.log('✅ User rooms created successfully');
    }

    await transaction.commit();
    console.log('✅ Transaction committed successfully');
    return user;
  } catch (error) {
    console.error('❌ Error in createWithRoomAssignment:', error.message);
    await transaction.rollback();
    console.log('⚠️ Transaction rolled back');
    throw error;
  }
};

exports.updateLastLogin = async (id) => {
  await userRepo.update(id, { last_login_at: new Date() });
};
