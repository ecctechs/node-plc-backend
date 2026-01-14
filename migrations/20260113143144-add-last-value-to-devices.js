'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('devices', 'last_value', {
      type: Sequelize.BOOLEAN,
      allowNull: true,
      comment: 'last known on/off value when PLC read succeeded'
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('devices', 'last_value');
  }
};
