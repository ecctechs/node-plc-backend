'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {

    /* ===============================
     * 1️⃣ devices.last_value
     * =============================== */
    const devicesTable = await queryInterface.describeTable('devices');

    if (devicesTable.last_value) {
      await queryInterface.sequelize.query(`
        ALTER TABLE devices
        ALTER COLUMN last_value
        TYPE FLOAT
        USING (
          CASE
            WHEN last_value IS TRUE THEN 1
            WHEN last_value IS FALSE THEN 0
            ELSE 0
          END
        );
      `);
    }

    /* ===============================
     * 2️⃣ device_logs.value
     * =============================== */
    const deviceLogsTable = await queryInterface.describeTable('device_logs');

    // ⭐ รองรับทั้ง value / data_value (กันชื่อไม่ตรง)
    if (deviceLogsTable.value) {
      await queryInterface.sequelize.query(`
        ALTER TABLE device_logs
        ALTER COLUMN value
        TYPE FLOAT
        USING (
          CASE
            WHEN value IS TRUE THEN 1
            WHEN value IS FALSE THEN 0
            ELSE 0
          END
        );
      `);
    }

    if (deviceLogsTable.data_value) {
      await queryInterface.sequelize.query(`
        ALTER TABLE device_logs
        ALTER COLUMN data_value
        TYPE FLOAT
        USING (
          CASE
            WHEN data_value IS TRUE THEN 1
            WHEN data_value IS FALSE THEN 0
            ELSE 0
          END
        );
      `);
    }
  },

  async down(queryInterface, Sequelize) {

    /* ===============================
     * rollback: FLOAT → BOOLEAN
     * =============================== */

    const devicesTable = await queryInterface.describeTable('devices');
    if (devicesTable.last_value) {
      await queryInterface.sequelize.query(`
        ALTER TABLE devices
        ALTER COLUMN last_value
        TYPE BOOLEAN
        USING (last_value = 1);
      `);
    }

    const deviceLogsTable = await queryInterface.describeTable('device_logs');

    if (deviceLogsTable.value) {
      await queryInterface.sequelize.query(`
        ALTER TABLE device_logs
        ALTER COLUMN value
        TYPE BOOLEAN
        USING (value = 1);
      `);
    }

    if (deviceLogsTable.data_value) {
      await queryInterface.sequelize.query(`
        ALTER TABLE device_logs
        ALTER COLUMN data_value
        TYPE BOOLEAN
        USING (data_value = 1);
      `);
    }
  }
};
