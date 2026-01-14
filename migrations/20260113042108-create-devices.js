'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('devices', {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false
      },

      name: {
        type: Sequelize.TEXT,
        allowNull: false
      },

      device_type: {
        type: Sequelize.TEXT,
        allowNull: false
        // lamp, pump, motor
      },

      data_display_type: {
        type: Sequelize.TEXT,
        allowNull: false,
        defaultValue: 'onoff'
      },

      plc_address: {
        type: Sequelize.TEXT,
        allowNull: false
      },

      refresh_rate_ms: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 1000
      },

      is_active: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true
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
      }
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('devices');
  }
};
