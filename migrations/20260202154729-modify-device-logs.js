'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // 1. เพิ่มคอลัมน์ status (Quality Code)
    await queryInterface.addColumn('device_logs', 'status', {
      type: Sequelize.INTEGER,
      allowNull: false,
      defaultValue: 1,
      after: 'value' // วางต่อจาก value
    });

    // 2. ปรับปรุง created_at ให้รองรับ Milliseconds (DATETIME(3))
    // หมายเหตุ: หากมีคอลัมน์เดิมอยู่แล้วใช้ changeColumn
    await queryInterface.changeColumn('device_logs', 'created_at', {
      type: Sequelize.DATE(3),
      defaultValue: Sequelize.literal('CURRENT_TIMESTAMP(3)'),
      allowNull: false
    });

    // 3. สร้าง Index เพื่อให้ Query ข้อมูลมหาศาลได้เร็ว
    await queryInterface.addIndex('device_logs', ['address_id', 'created_at'], {
      name: 'device_logs_address_timestamp_idx'
    });
  },

  down: async (queryInterface, Sequelize) => {
    // --- สั่ง Rollback กลับมาเหมือนเดิม ---
    
    // 1. ลบ Index ออก
    await queryInterface.removeIndex('device_logs', 'device_logs_address_timestamp_idx');

    // 2. ปรับ created_at กลับเป็นค่าปกติ (ไม่มี milliseconds)
    await queryInterface.changeColumn('device_logs', 'created_at', {
      type: Sequelize.DATE,
      allowNull: true
    });

    // 3. ลบคอลัมน์ status ออก
    await queryInterface.removeColumn('device_logs', 'status');
  }
};