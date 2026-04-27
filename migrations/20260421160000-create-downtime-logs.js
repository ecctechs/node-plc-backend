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
        references: {
          model: 'devices',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },

      event_type: {
        type: Sequelize.STRING(20),
        allowNull: false,
        comment: 'START=เริ่มหยุด, END=กลับมารัน'
      },

      reason: {
        type: Sequelize.STRING(255),
        allowNull: true
      },

      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.fn('now')
      }
    });

    await queryInterface.addIndex('downtime_logs', ['device_id']);
    await queryInterface.addIndex('downtime_logs', ['device_id', 'created_at']);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('downtime_logs');
  }
};