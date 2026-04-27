'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    // Add total_output column
    await queryInterface.addColumn('products', 'total_output', {
      type: Sequelize.INTEGER,
      allowNull: true,
      defaultValue: 0,
      comment: 'Total output count'
    });

    // Add plc_address_complete column
    await queryInterface.addColumn('products', 'plc_address_complete', {
      type: Sequelize.STRING(100),
      allowNull: true,
      comment: 'PLC Address for complete signal'
    });
  },

  async down (queryInterface, Sequelize) {
    // Remove total_output column
    await queryInterface.removeColumn('products', 'total_output');

    // Remove plc_address_complete column
    await queryInterface.removeColumn('products', 'plc_address_complete');
  }
};
