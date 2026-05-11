'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('device_addresses', {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false
      },
      device_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: { model: 'devices', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      plc_address: {
        type: Sequelize.STRING,
        allowNull: true
      },
      label: {
        type: Sequelize.STRING,
        allowNull: true
      },
      data_type: {
        type: Sequelize.STRING,
        allowNull: true
      },
      last_value: {
        type: Sequelize.FLOAT,
        allowNull: true
      },
      is_connected: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false
      },
      refresh_rate_ms: {
        type: Sequelize.INTEGER,
        allowNull: true
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
        type: 'TIMESTAMP(3)',
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      }
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('device_addresses');
  }
};
