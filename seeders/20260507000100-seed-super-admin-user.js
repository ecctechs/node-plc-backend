'use strict';

const bcrypt = require('bcryptjs');

module.exports = {
  async up(queryInterface, Sequelize) {
    const now = new Date();
    const password = 'SuperAdmin123!';
    const passwordHash = bcrypt.hashSync(password, 10);

    await queryInterface.bulkInsert('users', [
      {
        email: 'superadmin@example.com',
        password_hash: passwordHash,
        role: 'super_admin',
        is_active: true,
        created_at: now,
        updated_at: now
      }
    ], {});
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('users', { email: 'superadmin@example.com' }, {});
  }
};
