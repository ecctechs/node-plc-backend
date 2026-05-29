'use strict';

const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const userService = require('../services/user.service');
const userRepo = require('../repositories/user.repository');

const JWT_SECRET = process.env.JWT_SECRET || 'ChangeThisSecretToAStrongValue';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '8h';

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'email and password are required' });
    }

    const user = await userService.findByEmail(email);
    if (!user || !user.is_active) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    const passwordMatches = await bcrypt.compare(password, user.password_hash);
    if (!passwordMatches) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    await userService.updateLastLogin(user.id);

    const token = jwt.sign(
      {
        id: user.id,
        email: user.email,
        role: user.role,
        role_id: user.role_id || null,
        company_id: user.company_id || null
      },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );

    const permissions = user.customRole
      ? {
          role_id: user.customRole.id,
          role_name: user.customRole.name,
          tab_permissions: user.customRole.tab_permissions,
          scope_permissions: user.customRole.scope_permissions
        }
      : null;

    res.json({
      success: true,
      data: {
        token,
        user: {
          id: user.id,
          email: user.email,
          role: user.role,
          company_id: user.company_id || null,
          company: user.company ? { id: user.company.id, name: user.company.name } : null,
          is_active: user.is_active,
          employee_id: user.employee_id,
          employee: user.employee || null,
          rooms: (user.roomAssignments || []).map(ra => ({
            id: ra.room_id,
            name: ra.room?.name,
            scope: ra.scope
          })),
          permissions
        }
      }
    });
  } catch (err) {
    console.error(err);
    res.status(err.status || 500).json({ success: false, message: err.message });
  }
};

exports.changePassword = async (req, res) => {
  try {
    const { current_password, new_password } = req.body;

    if (!current_password || !new_password) {
      return res.status(400).json({ success: false, message: 'current_password and new_password are required' });
    }
    if (new_password.length < 6) {
      return res.status(400).json({ success: false, message: 'new_password must be at least 6 characters' });
    }

    const user = await userRepo.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const matches = await bcrypt.compare(current_password, user.password_hash);
    if (!matches) {
      return res.status(400).json({ success: false, message: 'current_password is incorrect' });
    }

    const password_hash = await bcrypt.hash(new_password, 10);
    await userRepo.update(req.user.id, { password_hash });

    res.json({ success: true, message: 'Password changed successfully' });
  } catch (err) {
    console.error(err);
    res.status(err.status || 500).json({ success: false, message: err.message });
  }
};
