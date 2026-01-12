'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('device_logs', {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false
      },

      device_name: {
        type: Sequelize.TEXT,
        allowNull: true
      },

      data_type: {
        type: Sequelize.TEXT,
        allowNull: true
      },

      address: {
        type: Sequelize.TEXT,
        allowNull: true
      },

      action: {
        type: Sequelize.TEXT,
        allowNull: true
      },

      value: {
        type: Sequelize.TEXT,
        allowNull: true
      },

      created_at: {
        type: Sequelize.DATE,
        allowNull: true,
        defaultValue: Sequelize.fn('now')
      }
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('device_logs');
  }
};
