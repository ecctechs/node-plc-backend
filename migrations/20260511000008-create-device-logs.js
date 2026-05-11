'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('device_logs', {
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
      value: {
        type: Sequelize.FLOAT,
        allowNull: true
      },
      status: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 1
      },
      created_at: {
        type: 'TIMESTAMP(3)',
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      }
    });

    await queryInterface.addIndex('device_logs', ['address_id', 'created_at']);
  },

  async down(queryInterface) {
    await queryInterface.dropTable('device_logs');
  }
};
