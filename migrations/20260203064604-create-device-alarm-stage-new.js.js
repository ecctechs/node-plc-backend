'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    try {
      await queryInterface.createTable('device_alarm_states', {
        id: {
          allowNull: false,
          autoIncrement: true,
          primaryKey: true,
          type: Sequelize.INTEGER
        },
        device_id: {
          type: Sequelize.INTEGER,
          allowNull: false
        },
        address_id: {
          type: Sequelize.INTEGER,
          allowNull: false
        },
        alarm_rule_id: {
          type: Sequelize.INTEGER,
          allowNull: false
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
    } catch (e) {
      if (!e.message.includes('already exists')) throw e;
    }

    try {
      await queryInterface.addColumn('device_alarm_states', 'address_id', {
        type: Sequelize.INTEGER,
        allowNull: true
      });
    } catch (e) {
      if (!e.message.includes('already exists')) throw e;
    }

    try {
      await queryInterface.addIndex('device_alarm_states', ['alarm_rule_id', 'address_id'], {
        name: 'idx_device_alarm_states_rule_address'
      });
    } catch (e) {
      if (!e.message.includes('already exists')) throw e;
    }
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('device_alarm_states');
  }
};