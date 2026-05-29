'use strict';
const bcrypt = require('bcryptjs');

module.exports = {
  async up(queryInterface) {
    const now = new Date();

    // ─── 1. Company B ──────────────────────────────
    await queryInterface.bulkInsert('companies', [{
      name: 'Company B',
      is_active: true,
      created_at: now,
      updated_at: now
    }]);

    const [companies] = await queryInterface.sequelize.query(
      `SELECT id FROM companies WHERE name = 'Company B' LIMIT 1`
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

    // ─── 3. Admin User ─────────────────────────────
    await queryInterface.bulkInsert('users', [{
      email: 'admin@companyb.com',
      password_hash: bcrypt.hashSync('Admin123!', 10),
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
    const [companies] = await queryInterface.sequelize.query(
      `SELECT id FROM companies WHERE name = 'Company B' LIMIT 1`
    );
    if (!companies.length) return;

    const companyId = companies[0].id;

    await queryInterface.bulkDelete('users', { company_id: companyId }, {});
    await queryInterface.bulkDelete('roles', { company_id: companyId }, {});
    await queryInterface.bulkDelete('companies', { id: companyId }, {});
  }
};
