'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('device_connection_logs', {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true
      },

      device_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'devices',
          key: 'id'
        },
        onDelete: 'CASCADE'
      },

      status: {
        type: Sequelize.ENUM('connected', 'disconnected'),
        allowNull: false
      },

      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.fn('now')
      }
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('device_connection_logs');
    await queryInterface.sequelize.query(
      'DROP TYPE IF EXISTS "enum_device_connection_logs_status";'
    );
  }
};
