'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.addColumn('products', 'plc_address_reject', {
      type: Sequelize.STRING(100),
      allowNull: true,
      comment: 'PLC Address for reject signal'
    });
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.removeColumn('products', 'plc_address_reject');
  }
};
