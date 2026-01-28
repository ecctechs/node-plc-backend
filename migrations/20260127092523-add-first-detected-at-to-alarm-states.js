'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('device_alarm_states', 'first_detected_at', {
      type: Sequelize.DATE,
      allowNull: true,
      comment: 'Timestamp when alarm condition was first detected (for duration delay)'
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('device_alarm_states', 'first_detected_at');
  }
};