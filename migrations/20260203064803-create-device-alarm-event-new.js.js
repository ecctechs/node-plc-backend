'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    try {
      await queryInterface.createTable('device_alarm_events', {
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
    } catch (e) {
      if (!e.message.includes('already exists')) throw e;
    }

    try {
      await queryInterface.addColumn('device_alarm_events', 'address_id', {
        type: Sequelize.INTEGER,
        allowNull: true
      });
    } catch (e) {
      if (!e.message.includes('already exists')) throw e;
    }

    try {
      await queryInterface.addIndex('device_alarm_events', ['device_id', 'created_at'], {
        name: 'idx_device_alarm_events_device_created'
      });
    } catch (e) {
      if (!e.message.includes('already exists')) throw e;
    }

    try {
      await queryInterface.addIndex('device_alarm_events', ['address_id', 'created_at'], {
        name: 'idx_device_alarm_events_address_created'
      });
    } catch (e) {
      if (!e.message.includes('already exists')) throw e;
    }
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('device_alarm_events');
  }
};