'use strict';
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('device_addresses', 'refresh_rate_ms', {
      type: Sequelize.INTEGER,
      allowNull: false,
      defaultValue: 1000 // ค่าเริ่มต้นเป็น 1 วินาที
    });
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('device_addresses', 'refresh_rate_ms');
  }
};