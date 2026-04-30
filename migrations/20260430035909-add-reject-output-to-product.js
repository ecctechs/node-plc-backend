'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.addColumn('products', 'reject_output', {
      type: Sequelize.INTEGER,
      allowNull: true,
      defaultValue: 0,
      comment: 'Total reject count'
    });
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.removeColumn('products', 'reject_output');
  }
};
