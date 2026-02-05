'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('device_alarm_events', {
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
      event_type: {
        type: Sequelize.STRING,
        allowNull: false
      },
      value: {
        type: Sequelize.FLOAT,
        allowNull: true
      },
      created_at: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      }
    });

    // เพิ่ม Index เพื่อให้การดึง Report ประวัติ Alarm รวดเร็วขึ้น
    await queryInterface.addIndex('device_alarm_events', ['device_id', 'created_at']);
    await queryInterface.addIndex('device_alarm_events', ['address_id', 'created_at']);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('device_alarm_events');
  }
};