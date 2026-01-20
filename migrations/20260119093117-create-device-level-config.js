'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('device_level_configs', {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true
      },

      device_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'devices', key: 'id' },
        onDelete: 'CASCADE'
      },

      level_index: {
        type: Sequelize.INTEGER,
        allowNull: false
      },

      label: {
        type: Sequelize.STRING,
        allowNull: false
      },

      mode: {
        type: Sequelize.STRING, // exact | criteria
        allowNull: false
      },

      /* ===== Exact ===== */
      exact_values: {
        type: Sequelize.ARRAY(Sequelize.FLOAT),
        allowNull: true
      },

      /* ===== Criteria ===== */
      condition_type: {
        type: Sequelize.STRING, // LT, LTE, MT, MTE, BTW
        allowNull: true
      },

      min_value: {
        type: Sequelize.FLOAT,
        allowNull: true
      },

      max_value: {
        type: Sequelize.FLOAT,
        allowNull: true
      },

      include_min: {
        type: Sequelize.BOOLEAN,
        defaultValue: true
      },

      include_max: {
        type: Sequelize.BOOLEAN,
        defaultValue: true
      },

      created_at: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.fn('NOW')
      },

      updated_at: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.fn('NOW')
      }
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('device_level_configs');
  }
};
