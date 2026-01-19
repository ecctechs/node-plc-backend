'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('device_level_configs', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      device_id: {
        type: Sequelize.INTEGER
      },
      level_index: {
        type: Sequelize.INTEGER
      },
      label: {
        type: Sequelize.STRING
      },
      condition_type: {
        type: Sequelize.STRING
      },
      min_value: {
        type: Sequelize.FLOAT
      },
      max_value: {
        type: Sequelize.FLOAT
      },
      include_min: {
        type: Sequelize.BOOLEAN
      },
      include_max: {
        type: Sequelize.BOOLEAN
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
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('device_level_configs');
  }
};