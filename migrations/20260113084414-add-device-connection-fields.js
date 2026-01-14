'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('devices', 'last_seen_at', {
      type: Sequelize.DATE,
      allowNull: true
    });

    await queryInterface.addColumn('devices', 'last_error_at', {
      type: Sequelize.DATE,
      allowNull: true
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('devices', 'last_seen_at');
    await queryInterface.removeColumn('devices', 'last_error_at');
  }
};
