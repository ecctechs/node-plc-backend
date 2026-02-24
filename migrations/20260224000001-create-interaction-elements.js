'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('interaction_elements', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
      },

      layout_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'interaction_layouts',
          key: 'id'
        },
        onDelete: 'CASCADE'
      },

      element_type: {
        type: Sequelize.STRING(50),
        allowNull: false,
        // 'status_lamp', 'number_display', 'control_button'
      },

      name: {
        type: Sequelize.STRING(255),
        allowNull: true,
        // ชื่อ element เช่น "Motor Status"
      },

      // Position (%)
      x_percent: {
        type: Sequelize.DECIMAL(5, 2),
        allowNull: false,
        // 0-100
      },

      y_percent: {
        type: Sequelize.DECIMAL(5, 2),
        allowNull: false,
        // 0-100
      },

      // Size & Style
      size_width: {
        type: Sequelize.INTEGER,
        allowNull: true,
        // ขนาด width
      },

      size_height: {
        type: Sequelize.INTEGER,
        allowNull: true,
        // ขนาด height
      },

      font_size: {
        type: Sequelize.INTEGER,
        allowNull: true,
        // สำหรับ text
      },

      bg_color: {
        type: Sequelize.STRING(20),
        allowNull: true,
        // background color
      },

      text_color: {
        type: Sequelize.STRING(20),
        allowNull: true,
        // text color
      },

      // Element Specific
      unit: {
        type: Sequelize.STRING(20),
        allowNull: true,
        // สำหรับ number display
      },

      precision: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0,
        // ทศนิยม
      },

      // Control Button Specific
      active_color: {
        type: Sequelize.STRING(20),
        allowNull: true,
      },

      inactive_color: {
        type: Sequelize.STRING(20),
        allowNull: true,
      },

      button_label: {
        type: Sequelize.STRING(50),
        allowNull: true,
      },

      // PLC Link
      device_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'devices',
          key: 'id'
        }
      },

      address_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'device_addresses',
          key: 'id'
        }
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

    // optional indexes
    await queryInterface.addIndex('interaction_elements', ['layout_id']);
    await queryInterface.addIndex('interaction_elements', ['device_id']);
    await queryInterface.addIndex('interaction_elements', ['address_id']);
  },

  async down(queryInterface) {
    await queryInterface.dropTable('interaction_elements');
  }
};
