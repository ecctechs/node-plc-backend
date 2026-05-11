'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('downtime_logs', {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false
      },
      device_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'devices', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      address_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: { model: 'device_addresses', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
      },
      event_type: {
        type: Sequelize.STRING(20),
        allowNull: false
      },
      reason: {
        type: Sequelize.STRING(255),
        allowNull: true
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      }
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('downtime_logs');
  }
};
