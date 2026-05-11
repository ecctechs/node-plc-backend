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
        allowNull: true
      },
      plc_address_output: {
        type: Sequelize.STRING(100),
        allowNull: true
      },
      plc_address_active: {
        type: Sequelize.STRING(100),
        allowNull: true
      },
      total_output: {
        type: Sequelize.INTEGER,
        allowNull: true,
        defaultValue: 0
      },
      plc_address_complete: {
        type: Sequelize.STRING(100),
        allowNull: true
      },
      plc_address_reject: {
        type: Sequelize.STRING(100),
        allowNull: true
      },
      reject_output: {
        type: Sequelize.INTEGER,
        allowNull: true,
        defaultValue: 0
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      }
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('products');
  }
};
