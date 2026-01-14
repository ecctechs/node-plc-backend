'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('device_number_configs', {
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

      decimal_places: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0
      },

      scale: {
        type: Sequelize.FLOAT,
        allowNull: false,
        defaultValue: 1
      },

      offset: {
        type: Sequelize.FLOAT,
        allowNull: false,
        defaultValue: 0
      },

      min_value: {
        type: Sequelize.FLOAT,
        allowNull: true
      },

      max_value: {
        type: Sequelize.FLOAT,
        allowNull: true
      },

      unit: {
        type: Sequelize.STRING,
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
      }
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('device_number_configs');
  }
};
