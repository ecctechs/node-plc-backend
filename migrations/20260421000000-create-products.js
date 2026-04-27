'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('products', {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false
      },

      name: {
        type: Sequelize.STRING(255),
        allowNull: false
      },

      image_path: {
        type: Sequelize.TEXT,
        allowNull: true
      },

      cycle_time: {
        type: Sequelize.FLOAT,
        allowNull: true,
        comment: 'Cycle time in seconds'
      },

      plc_address_output: {
        type: Sequelize.STRING(100),
        allowNull: true,
        comment: 'PLC Address for count signal (ON/OFF)'
      },

      plc_address_active: {
        type: Sequelize.STRING(100),
        allowNull: true,
        comment: 'PLC Address for running status signal'
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

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('products');
  }
};