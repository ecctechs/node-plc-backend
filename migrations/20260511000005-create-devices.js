'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('devices', {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false
      },
      name: {
        type: Sequelize.TEXT,
        allowNull: false
      },
      device_type_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: { model: 'device_types', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
      },
      room_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: { model: 'rooms', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
      },
      refresh_rate_ms: {
        type: Sequelize.INTEGER,
        allowNull: true,
        defaultValue: 1000
      },
      last_seen_at: {
        type: Sequelize.DATE,
        allowNull: true
      },
      last_error_at: {
        type: Sequelize.DATE,
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
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      }
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('devices');
  }
};
