'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Table already exists from migration 20260122094023-create-device-alarm-rules.js
    // This migration just adds address_id if needed
  },

  down: async (queryInterface, Sequelize) => {
    // No rollback needed
  }
};