'use strict';

const TABLES = [
  'rooms',
  'device_types',
  'devices',
  'products',
  'employees',
  'working_time',
  'dashboard_cards',
  'interaction_layouts',
  'oee_daily_snapshots',
  'oee_hourly_snapshots',
];

module.exports = {
  async up(queryInterface) {
    // ตรวจสอบว่ามีข้อมูลที่ต้อง backfill ไหม
    const [[{ count }]] = await queryInterface.sequelize.query(
      `SELECT COUNT(*) AS count FROM rooms WHERE company_id IS NULL`
    );

    // DB ใหม่ (ไม่มีข้อมูล) — ข้ามได้เลย
    if (parseInt(count, 10) === 0) return;

    // DB เก่า — ต้องมี Default Factory
    const [[company]] = await queryInterface.sequelize.query(
      `SELECT id FROM companies WHERE name = 'Default Factory' LIMIT 1`
    );

    if (!company) {
      throw new Error("Backfill aborted: company 'Default Factory' not found. Please run seed-initial-data first.");
    }

    const companyId = company.id;

    for (const table of TABLES) {
      await queryInterface.sequelize.query(
        `UPDATE "${table}" SET company_id = :companyId WHERE company_id IS NULL`,
        { replacements: { companyId } }
      );
    }
  },

  async down(queryInterface) {
    for (const table of TABLES) {
      await queryInterface.sequelize.query(
        `UPDATE "${table}" SET company_id = NULL`
      );
    }
  },
};
