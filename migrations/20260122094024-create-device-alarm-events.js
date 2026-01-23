'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('device_alarm_events', {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true
      },

      device_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'devices',
          key: 'id'
        },
        onDelete: 'CASCADE'
      },

      alarm_rule_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'device_alarm_rules',
          key: 'id'
        },
        onDelete: 'CASCADE'
      },

      event_type: {
        type: Sequelize.STRING, // TRIGGER | RECOVER
        allowNull: false
      },

      value: {
        type: Sequelize.FLOAT,
        allowNull: true
      },

      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.fn('now')
      }
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('device_alarm_events');
  }
};
