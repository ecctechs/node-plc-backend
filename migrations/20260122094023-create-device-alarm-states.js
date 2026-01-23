'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('device_alarm_states', {
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
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.fn('now')
      },

      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.fn('now')
      },

      unique: {
        type: Sequelize.STRING
      }
    });

    // unique constraint (device + rule)
    await queryInterface.addConstraint('device_alarm_states', {
      fields: ['device_id', 'alarm_rule_id'],
      type: 'unique',
      name: 'uniq_device_alarm_state'
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('device_alarm_states');
  }
};
