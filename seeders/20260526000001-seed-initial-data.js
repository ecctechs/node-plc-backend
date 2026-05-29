'use strict';
const bcrypt = require('bcryptjs');

module.exports = {
  async up(queryInterface) {
    const now = new Date();

    // ─── Clear ข้อมูลเก่าทั้งหมด (CASCADE จัดการ FK ทั้งหมด) ───
    await queryInterface.sequelize.query('TRUNCATE TABLE companies CASCADE');

    // ─── 1. Company ────────────────────────────────
    await queryInterface.bulkInsert('companies', [{
      name: 'Default Factory',
      is_active: true,
      created_at: now,
      updated_at: now
    }]);

    const [companies] = await queryInterface.sequelize.query(
      `SELECT id FROM companies WHERE name = 'Default Factory' LIMIT 1`
    );
    const companyId = companies[0].id;

    // ─── 2. Roles + Permissions ────────────────────
    const rolesData = [
      {
        name: 'admin',
        tab_permissions: {
          dashboard: true, oee: true, alarmhistory: true,
          interaction: true, demo: true, setting: true
        },
        scope_permissions: {
          view: true, edit: true, export: true, control: true
        }
      },
      {
        name: 'operator',
        tab_permissions: {
          dashboard: true, oee: true, alarmhistory: true,
          interaction: true, demo: false, setting: false
        },
        scope_permissions: {
          view: true, edit: false, export: true, control: true
        }
      },
      {
        name: 'viewer',
        tab_permissions: {
          dashboard: true, oee: true, alarmhistory: true,
          interaction: false, demo: false, setting: false
        },
        scope_permissions: {
          view: true, edit: false, export: false, control: false
        }
      }
    ];

    await queryInterface.bulkInsert('roles',
      rolesData.map(r => ({
        name: r.name,
        company_id: companyId,
        tab_permissions: JSON.stringify(r.tab_permissions),
        scope_permissions: JSON.stringify(r.scope_permissions),
        is_active: true,
        created_at: now,
        updated_at: now
      }))
    );

    // ─── 3. Super Admin User ───────────────────────
    await queryInterface.bulkInsert('users', [{
      email: 'superadmin@example.com',
      password_hash: bcrypt.hashSync('SuperAdmin123!', 10),
      role: 'super_admin',
      role_id: null,
      company_id: companyId,
      is_active: true,
      created_at: now,
      updated_at: now
    }]);

    // ─── 4. Working Time ──────────────────────────
    await queryInterface.bulkInsert('working_time', [{
      company_id: companyId,
      schedule: JSON.stringify({
        monday:    { working_hours: [{ start: '09:00', end: '18:00' }], break_times: [{ start: '12:00', end: '13:00' }] },
        tuesday:   { working_hours: [{ start: '09:00', end: '18:00' }], break_times: [{ start: '12:00', end: '13:00' }] },
        wednesday: { working_hours: [{ start: '09:00', end: '18:00' }], break_times: [{ start: '12:00', end: '13:00' }] },
        thursday:  { working_hours: [{ start: '09:00', end: '18:00' }], break_times: [{ start: '12:00', end: '13:00' }] },
        friday:    { working_hours: [{ start: '09:00', end: '18:00' }], break_times: [{ start: '12:00', end: '13:00' }] },
        saturday:  { working_hours: [], break_times: [] },
        sunday:    { working_hours: [], break_times: [] }
      }),
      created_at: now,
      updated_at: now
    }]);

  },

  async down(queryInterface) {
    await queryInterface.bulkDelete('user_rooms', null, {});
    await queryInterface.bulkDelete('users', null, {});
    await queryInterface.bulkDelete('roles', null, {});
    await queryInterface.bulkDelete('companies', null, {});
  }
};
