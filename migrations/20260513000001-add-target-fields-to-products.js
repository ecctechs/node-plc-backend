'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('products', 'target_oee', {
      type: Sequelize.FLOAT,
      allowNull: true,
      defaultValue: null
    });
    await queryInterface.addColumn('products', 'target_output', {
      type: Sequelize.INTEGER,
      allowNull: true,
      defaultValue: null
    });
  },

  async down(queryInterface) {
    await queryInterface.removeColumn('products', 'target_oee');
    await queryInterface.removeColumn('products', 'target_output');
  }
};
