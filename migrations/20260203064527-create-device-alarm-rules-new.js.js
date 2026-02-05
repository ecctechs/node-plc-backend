'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('device_alarm_rules', {
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
      address_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'device_addresses', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      name: { type: Sequelize.STRING, allowNull: false },
      data_type: { type: Sequelize.STRING, allowNull: false },
      condition_type: { type: Sequelize.STRING, allowNull: false },
      min_value: { type: Sequelize.FLOAT },
      max_value: { type: Sequelize.FLOAT },
      level_index: { type: Sequelize.INTEGER },
      duration_sec: { type: Sequelize.INTEGER, defaultValue: 0 },
      repeat_interval_sec: { type: Sequelize.INTEGER, defaultValue: 900 },
      severity: { type: Sequelize.STRING, defaultValue: 'warning' },
      notify_email: { type: Sequelize.BOOLEAN, defaultValue: true },
      email_recipients: { type: Sequelize.ARRAY(Sequelize.STRING) },
      is_active: { type: Sequelize.BOOLEAN, defaultValue: true },
      created_at: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },
      updated_at: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      }
    });

    // ✅ แก้ปัญหา ERROR: ระบุชื่อ Index ให้ชัดเจนเพื่อไม่ให้ซ้ำกับระบบ
    await queryInterface.addIndex('device_alarm_rules', ['address_id'], {
      name: 'idx_device_alarm_rules_address_id_unique' 
    });
    
    await queryInterface.addIndex('device_alarm_rules', ['device_id'], {
      name: 'idx_device_alarm_rules_device_id_unique'
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('device_alarm_rules');
  }
};