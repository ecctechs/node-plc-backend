'use strict';

const defaultSchedule = {
  monday:    { working_hours: [{ start: '09:00', end: '18:00' }], break_times: [{ start: '12:00', end: '13:00' }] },
  tuesday:   { working_hours: [{ start: '09:00', end: '18:00' }], break_times: [{ start: '12:00', end: '13:00' }] },
  wednesday: { working_hours: [{ start: '09:00', end: '18:00' }], break_times: [{ start: '12:00', end: '13:00' }] },
  thursday:  { working_hours: [{ start: '09:00', end: '18:00' }], break_times: [{ start: '12:00', end: '13:00' }] },
  friday:    { working_hours: [{ start: '09:00', end: '18:00' }], break_times: [{ start: '12:00', end: '13:00' }] },
  saturday:  { working_hours: [], break_times: [] },
  sunday:    { working_hours: [], break_times: [] }
};

module.exports = {
  async up(queryInterface) {
    const now = new Date();

    const [companies] = await queryInterface.sequelize.query(
      `SELECT id FROM companies WHERE is_active = true ORDER BY id ASC`
    );

    // ถ้าไม่มี company (เช่น fresh DB ที่ยังไม่ได้ seed) ข้ามไปก่อน
    // working_time จะถูกสร้างโดย seed-initial-data และ seed-company-b แทน
    if (!companies.length) return;

    // insert เฉพาะ company ที่ยังไม่มี working_time
    const [existing] = await queryInterface.sequelize.query(
      `SELECT company_id FROM working_time`
    );
    const existingIds = new Set(existing.map(r => r.company_id));
    const toInsert = companies.filter(c => !existingIds.has(c.id));

    if (!toInsert.length) return;

    await queryInterface.bulkInsert('working_time',
      toInsert.map(c => ({
        company_id: c.id,
        schedule: JSON.stringify(defaultSchedule),
        created_at: now,
        updated_at: now
      }))
    );
  },

  async down(queryInterface) {
    await queryInterface.bulkDelete('working_time', null, {});
  }
};
