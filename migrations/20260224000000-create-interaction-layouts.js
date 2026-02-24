'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('interaction_layouts', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
      },

      name: {
        type: Sequelize.STRING(255),
        allowNull: false,
        // ชื่อ layout เช่น "TPM Line 1"
      },

      machine_image: {
        type: Sequelize.STRING(500),
        allowNull: true,
        // path ของรูป background
      },

      aspect_ratio_width: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 16,
        // aspect ratio ส่วนกว้าง
      },

      aspect_ratio_height: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 9,
        // aspect ratio ส่วนสูง
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
    await queryInterface.addIndex('interaction_layouts', ['name']);
  },

  async down(queryInterface) {
    await queryInterface.dropTable('interaction_layouts');
  }
};
