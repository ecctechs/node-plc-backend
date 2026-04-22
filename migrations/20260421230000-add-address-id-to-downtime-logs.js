'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('downtime_logs', 'address_id', {
      type: Sequelize.INTEGER,
      allowNull: true,
      references: {
        model: 'device_addresses',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL'
    });

    await queryInterface.addIndex('downtime_logs', ['address_id']);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('downtime_logs', 'address_id');
  }
};