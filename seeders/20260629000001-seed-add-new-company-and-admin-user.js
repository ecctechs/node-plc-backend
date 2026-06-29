'use strict';
const bcrypt = require('bcryptjs');

// =============================================================================
// SEEDER: เพิ่ม Company ใหม่พร้อม Admin User
// =============================================================================
//
// วิธีใช้งาน:
//   1. แก้ไข CONFIG ด้านล่างนี้ให้ตรงกับข้อมูลที่ต้องการ
//   2. รัน seeder:
//        npx sequelize-cli db:seed --seed 20260629000001-seed-add-new-company-and-admin-user.js
//   3. ถ้าต้องการยกเลิก (ลบข้อมูลที่เพิ่งสร้าง):
//        npx sequelize-cli db:seed:undo --seed 20260629000001-seed-add-new-company-and-admin-user.js
//
// หมายเหตุ:
//   - ถ้า Company ชื่อซ้ำ หรือ Email ซ้ำ → seeder จะหยุดและแจ้ง error ทันที
//   - Password ต้องมีความยาวอย่างน้อย 8 ตัว
// =============================================================================

// ─── แก้ไขตรงนี้ ──────────────────────────────────────────────────────────────
const CONFIG = {
  company: {
    name: 'Company C',            // ← เปลี่ยนชื่อบริษัท (ต้องไม่ซ้ำกับที่มีอยู่)
  },
  adminUser: {
    email: 'admin@companyc.com',  // ← เปลี่ยน email (ต้องไม่ซ้ำกับที่มีอยู่)
    password: 'Admin123!',        // ← เปลี่ยน password (ขั้นต่ำ 8 ตัว)
  },
  workingHours: {
    weekday: { start: '09:00', end: '18:00' },   // ← เวลาเข้า-ออก จันทร์-ศุกร์
    breakTime: { start: '12:00', end: '13:00' },  // ← เวลาพัก
    // วันเสาร์-อาทิตย์: ไม่ทำงาน (หากต้องการให้ทำงาน แก้ที่ schedule ด้านล่าง)
  },
};
// ─────────────────────────────────────────────────────────────────────────────

module.exports = {
  async up(queryInterface) {
    const now = new Date();

    // ── Guard: ตรวจ Company ซ้ำ ───────────────────────────────────────────────
    const [existingCompany] = await queryInterface.sequelize.query(
      `SELECT id FROM companies WHERE name = :name LIMIT 1`,
      { replacements: { name: CONFIG.company.name } }
    );
    if (existingCompany.length > 0) {
      throw new Error(
        `[SEED ERROR] Company ชื่อ "${CONFIG.company.name}" มีอยู่แล้วในระบบ\n` +
        `             กรุณาเปลี่ยน CONFIG.company.name เป็นชื่อที่ไม่ซ้ำ`
      );
    }

    // ── Guard: ตรวจ Email ซ้ำ ────────────────────────────────────────────────
    const [existingUser] = await queryInterface.sequelize.query(
      `SELECT id FROM users WHERE email = :email LIMIT 1`,
      { replacements: { email: CONFIG.adminUser.email } }
    );
    if (existingUser.length > 0) {
      throw new Error(
        `[SEED ERROR] Email "${CONFIG.adminUser.email}" มีอยู่แล้วในระบบ\n` +
        `             กรุณาเปลี่ยน CONFIG.adminUser.email เป็น email ที่ไม่ซ้ำ`
      );
    }

    // ── Guard: ตรวจ Password ขั้นต่ำ ─────────────────────────────────────────
    if (CONFIG.adminUser.password.length < 8) {
      throw new Error(
        `[SEED ERROR] Password ต้องมีความยาวอย่างน้อย 8 ตัวอักษร`
      );
    }

    // ─── 1. สร้าง Company ────────────────────────────────────────────────────
    await queryInterface.bulkInsert('companies', [{
      name: CONFIG.company.name,
      is_active: true,
      created_at: now,
      updated_at: now,
    }]);

    const [companies] = await queryInterface.sequelize.query(
      `SELECT id FROM companies WHERE name = :name LIMIT 1`,
      { replacements: { name: CONFIG.company.name } }
    );
    const companyId = companies[0].id;
    console.log(`✓ สร้าง Company "${CONFIG.company.name}" (id: ${companyId})`);

    // ─── 2. สร้าง Roles 3 ระดับ ─────────────────────────────────────────────
    //   admin    → เข้าถึงได้ทุก tab + แก้ไข/ควบคุมได้ทุกอย่าง
    //   operator → ไม่เห็น demo/setting + ไม่สามารถ edit ได้
    //   viewer   → ดูได้อย่างเดียว ไม่มี export/control
    const rolesData = [
      {
        name: 'admin',
        tab_permissions:   { dashboard: true,  oee: true, alarmhistory: true, interaction: true,  demo: true,  setting: true  },
        scope_permissions: { view: true, edit: true,  export: true,  control: true  },
      },
      {
        name: 'operator',
        tab_permissions:   { dashboard: true,  oee: true, alarmhistory: true, interaction: true,  demo: false, setting: false },
        scope_permissions: { view: true, edit: false, export: true,  control: true  },
      },
      {
        name: 'viewer',
        tab_permissions:   { dashboard: true,  oee: true, alarmhistory: true, interaction: false, demo: false, setting: false },
        scope_permissions: { view: true, edit: false, export: false, control: false },
      },
    ];

    await queryInterface.bulkInsert('roles',
      rolesData.map(r => ({
        name:               r.name,
        company_id:         companyId,
        tab_permissions:    JSON.stringify(r.tab_permissions),
        scope_permissions:  JSON.stringify(r.scope_permissions),
        is_active:          true,
        created_at:         now,
        updated_at:         now,
      }))
    );
    console.log(`✓ สร้าง Roles: admin, operator, viewer`);

    // ─── 3. สร้าง Super Admin User ───────────────────────────────────────────
    //   role: 'super_admin' → role_id ไม่จำเป็นต้องใส่ (null ได้)
    //   ถ้าต้องการ user ระดับอื่น (admin/operator/viewer) ดูตัวอย่างด้านล่าง
    await queryInterface.bulkInsert('users', [{
      email:         CONFIG.adminUser.email,
      password_hash: bcrypt.hashSync(CONFIG.adminUser.password, 10),
      role:          'super_admin',
      role_id:       null,
      company_id:    companyId,
      is_active:     true,
      created_at:    now,
      updated_at:    now,
    }]);
    console.log(`✓ สร้าง Super Admin User: ${CONFIG.adminUser.email}`);

    // ─── ตัวอย่าง: สร้าง User ระดับ operator (เปิด comment ถ้าต้องการ) ───────
    // const [roles] = await queryInterface.sequelize.query(
    //   `SELECT id FROM roles WHERE name = 'operator' AND company_id = :cid LIMIT 1`,
    //   { replacements: { cid: companyId } }
    // );
    // await queryInterface.bulkInsert('users', [{
    //   email:         'operator@companyc.com',   // ← เปลี่ยน email
    //   password_hash: bcrypt.hashSync('Operator123!', 10),
    //   role:          'operator',
    //   role_id:       roles[0].id,               // ← ต้องใส่ role_id สำหรับ non-super_admin
    //   company_id:    companyId,
    //   is_active:     true,
    //   created_at:    now,
    //   updated_at:    now,
    // }]);

    // ─── 4. Working Time ─────────────────────────────────────────────────────
    const { weekday, breakTime } = CONFIG.workingHours;
    await queryInterface.bulkInsert('working_time', [{
      company_id: companyId,
      schedule: JSON.stringify({
        monday:    { working_hours: [weekday], break_times: [breakTime] },
        tuesday:   { working_hours: [weekday], break_times: [breakTime] },
        wednesday: { working_hours: [weekday], break_times: [breakTime] },
        thursday:  { working_hours: [weekday], break_times: [breakTime] },
        friday:    { working_hours: [weekday], break_times: [breakTime] },
        saturday:  { working_hours: [],        break_times: []           },
        sunday:    { working_hours: [],        break_times: []           },
      }),
      created_at: now,
      updated_at: now,
    }]);
    console.log(`✓ สร้าง Working Time (จันทร์-ศุกร์ ${weekday.start}-${weekday.end})`);

    console.log(`\n✅ เสร็จสมบูรณ์ — Company "${CONFIG.company.name}" พร้อมใช้งาน`);
    console.log(`   Login: ${CONFIG.adminUser.email} / ${CONFIG.adminUser.password}`);
  },

  // ─── undo: ลบข้อมูลที่สร้างโดย seeder นี้ทั้งหมด ──────────────────────────
  async down(queryInterface) {
    const [companies] = await queryInterface.sequelize.query(
      `SELECT id FROM companies WHERE name = :name LIMIT 1`,
      { replacements: { name: CONFIG.company.name } }
    );
    if (!companies.length) {
      console.log(`[UNDO] ไม่พบ Company "${CONFIG.company.name}" — ข้ามการลบ`);
      return;
    }

    const companyId = companies[0].id;
    await queryInterface.bulkDelete('working_time', { company_id: companyId }, {});
    await queryInterface.bulkDelete('users',        { company_id: companyId }, {});
    await queryInterface.bulkDelete('roles',        { company_id: companyId }, {});
    await queryInterface.bulkDelete('companies',    { id: companyId },         {});
    console.log(`✓ ลบ Company "${CONFIG.company.name}" และข้อมูลที่เกี่ยวข้องทั้งหมดแล้ว`);
  },
};
