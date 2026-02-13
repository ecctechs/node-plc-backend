'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('dashboard_cards', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
      },

      user_id: {
        type: Sequelize.INTEGER,
        allowNull: false
      },

      device_id: {
        type: Sequelize.INTEGER,
        allowNull: false
      },

      address_id: {
        type: Sequelize.INTEGER,
        allowNull: false
      },

      display_type: {
        type: Sequelize.STRING,
        allowNull: false
        // เช่น number | gauge | onoff | level
      },

      position: {
        type: Sequelize.INTEGER,
        allowNull: true
        // ใช้เรียง card (drag & drop)
      },

      is_active: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true
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

    // optional index
    await queryInterface.addIndex('dashboard_cards', ['user_id']);
    await queryInterface.addIndex('dashboard_cards', ['address_id']);
  },

  async down(queryInterface) {
    await queryInterface.dropTable('dashboard_cards');
  }
};
