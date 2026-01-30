'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // 1. สร้างตาราง device_addresses
    await queryInterface.createTable('device_addresses', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      device_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'devices', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      label: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      plc_address: {
        type: Sequelize.TEXT,
        allowNull: false
      },
      last_value: {
        type: Sequelize.FLOAT,
        allowNull: true
      },
      created_at: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updated_at: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });

    // 2. Data Migration: คัดลอก address เดิมจากตาราง devices ไปยังตารางใหม่
    // ใช้ SQL ดิบเพื่อให้มั่นใจว่าข้อมูลไม่หาย
    await queryInterface.sequelize.query(`
      INSERT INTO device_addresses (device_id, plc_address, last_value, created_at, updated_at)
      SELECT id, plc_address, last_value, NOW(), NOW()
      FROM devices
      WHERE plc_address IS NOT NULL;
    `);

    // 3. ลบ Column เก่าออกจากตาราง devices
    await queryInterface.removeColumn('devices', 'plc_address');
    await queryInterface.removeColumn('devices', 'last_value');
  },

  down: async (queryInterface, Sequelize) => {
    // กรณี Rollback: ต้องสร้าง Column กลับคืนมาก่อน
    await queryInterface.addColumn('devices', 'plc_address', { type: Sequelize.TEXT });
    await queryInterface.addColumn('devices', 'last_value', { type: Sequelize.FLOAT });

    // ย้ายข้อมูลกลับ (เลือกเอาตัวแรกที่เจอใน device_addresses)
    await queryInterface.sequelize.query(`
      UPDATE devices d
      SET plc_address = (SELECT plc_address FROM device_addresses da WHERE da.device_id = d.id LIMIT 1),
          last_value = (SELECT last_value FROM device_addresses da WHERE da.device_id = d.id LIMIT 1);
    `);

    await queryInterface.dropTable('device_addresses');
  }
};