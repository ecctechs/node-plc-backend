'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('interaction_layouts', {
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
      machine_image: {
        type: Sequelize.STRING(500),
        allowNull: true
      },
      aspect_ratio_width: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 16
      },
      aspect_ratio_height: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 9
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
    await queryInterface.dropTable('interaction_layouts');
  }
};
