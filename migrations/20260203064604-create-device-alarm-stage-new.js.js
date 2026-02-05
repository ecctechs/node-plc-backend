'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('device_alarm_states', {
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
      alarm_rule_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'device_alarm_rules', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      is_active: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false
      },
      last_triggered_at: {
        type: Sequelize.DATE,
        allowNull: true
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

    // เพิ่ม Index เพื่อให้ processAlarms ค้นหาสถานะปัจจุบันได้เร็วขึ้น
    await queryInterface.addIndex('device_alarm_states', ['alarm_rule_id', 'address_id']);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('device_alarm_states');
  }
};