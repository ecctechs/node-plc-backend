'use strict';

const bcrypt = require('bcryptjs');
const userService = require('../services/user.service');

const allowedRoles = ['super_admin', 'admin', 'operator', 'viewer', 'guest'];
const allowedScopes = ['view', 'control', 'manage'];

exports.createUser = async (req, res) => {
  try {
    const { email, password, role, employee_id, is_active, rooms } = req.body;

    if (!email || !password || !role) {
      return res.status(400).json({ success: false, message: 'email, password, and role are required' });
    }

    if (!allowedRoles.includes(role)) {
      return res.status(400).json({ success: false, message: `role must be one of: ${allowedRoles.join(', ')}` });
    }

    // Validate rooms if provided
    if (rooms && Array.isArray(rooms)) {
      for (const room of rooms) {
        // if (!room.room_id) {
        //   return res.status(400).json({ success: false, message: 'room_id is required for each room' });
        // }
        if (room.scope && !allowedScopes.includes(room.scope)) {
          return res.status(400).json({ success: false, message: `scope must be one of: ${allowedScopes.join(', ')}` });
        }
      }
    }

    const existingUser = await userService.findByEmail(email);
    console.log('Email check:', { email, existingUserFound: !!existingUser });
    if (existingUser) {
      return res.status(409).json({ success: false, message: 'Email already in use' });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const createdBy = req.user?.id || null;

    const userData = {
      email,
      password_hash: passwordHash,
      role,
      is_active: typeof is_active === 'boolean' ? is_active : true,
      employee_id: employee_id || null,
      created_by: createdBy
    };

    // Prepare room assignments
    const roomAssignments = (rooms && Array.isArray(rooms) && rooms.length > 0) ? rooms : [];

    const user = await userService.createWithRoomAssignment(userData, roomAssignments);

    res.status(201).json({
      success: true,
      data: {
        id: user.id,
        email: user.email,
        role: user.role,
        is_active: user.is_active,
        employee_id: user.employee_id,
        created_by: user.created_by,
        rooms: rooms || []
      }
    });
  } catch (err) {
    console.error(err);
    
    // Handle Sequelize validation errors
    if (err.name === 'SequelizeValidationError') {
      const messages = err.errors.map(e => e.message);
      return res.status(400).json({ success: false, message: messages.join(', ') });
    }
    
    // Handle unique constraint errors
    if (err.name === 'SequelizeUniqueConstraintError') {
      return res.status(409).json({ success: false, message: 'Email already in use' });
    }

    res.status(err.status || 500).json({ success: false, message: err.message });
  }
};
