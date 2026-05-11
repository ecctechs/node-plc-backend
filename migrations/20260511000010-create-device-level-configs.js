'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('device_level_configs', {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false
      },
      address_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'device_addresses', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      level_index: {
        type: Sequelize.INTEGER,
        allowNull: true,
        defaultValue: 0
      },
      label: {
        type: Sequelize.TEXT,
        allowNull: false
      },
      condition_type: {
        type: Sequelize.TEXT,
        allowNull: false
      },
      min_value: {
        type: Sequelize.FLOAT,
        allowNull: true
      },
      max_value: {
        type: Sequelize.FLOAT,
        allowNull: true
      },
      mode: {
        type: Sequelize.TEXT,
        allowNull: true,
        defaultValue: 'range'
      },
      exact_values: {
        type: Sequelize.ARRAY(Sequelize.INTEGER),
        allowNull: true,
        defaultValue: []
      },
      include_min: {
        type: Sequelize.BOOLEAN,
        allowNull: true,
        defaultValue: true
      },
      include_max: {
        type: Sequelize.BOOLEAN,
        allowNull: true,
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
    await queryInterface.dropTable('device_level_configs');
  }
};
