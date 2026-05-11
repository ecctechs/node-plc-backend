'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('interaction_elements', {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false
      },
      layout_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'interaction_layouts', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      element_type: {
        type: Sequelize.STRING(50),
        allowNull: false
      },
      name: {
        type: Sequelize.STRING(255),
        allowNull: true
      },
      x_percent: {
        type: Sequelize.DECIMAL(5, 2),
        allowNull: false
      },
      y_percent: {
        type: Sequelize.DECIMAL(5, 2),
        allowNull: false
      },
      size_width: {
        type: Sequelize.INTEGER,
        allowNull: true
      },
      size_height: {
        type: Sequelize.INTEGER,
        allowNull: true
      },
      font_size: {
        type: Sequelize.INTEGER,
        allowNull: true
      },
      bg_color: {
        type: Sequelize.STRING(20),
        allowNull: true
      },
      text_color: {
        type: Sequelize.STRING(20),
        allowNull: true
      },
      unit: {
        type: Sequelize.STRING(20),
        allowNull: true
      },
      precision: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0
      },
      active_color: {
        type: Sequelize.STRING(20),
        allowNull: true
      },
      inactive_color: {
        type: Sequelize.STRING(20),
        allowNull: true
      },
      button_label: {
        type: Sequelize.STRING(50),
        allowNull: true
      },
      device_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: { model: 'devices', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
      },
      address_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: { model: 'device_addresses', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
      },
      display_order: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0
      },
      is_visible: {
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
  },

  async down(queryInterface) {
    await queryInterface.dropTable('interaction_elements');
  }
};
