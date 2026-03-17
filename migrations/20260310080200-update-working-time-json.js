'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    // Drop the existing table and recreate with new schema
    await queryInterface.dropTable('working_time');

    await queryInterface.createTable('working_time', {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true
      },

      schedule: {
        type: Sequelize.JSON,
        allowNull: true,
        defaultValue: {
          monday: { working_hours: [], break_times: [] },
          tuesday: { working_hours: [], break_times: [] },
          wednesday: { working_hours: [], break_times: [] },
          thursday: { working_hours: [], break_times: [] },
          friday: { working_hours: [], break_times: [] },
          saturday: { working_hours: [], break_times: [] },
          sunday: { working_hours: [], break_times: [] }
        }
      },

      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.fn('now')
      },

      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.fn('now')
      }
    });
  },

  async down(queryInterface, Sequelize) {
    // Drop and recreate with old schema
    await queryInterface.dropTable('working_time');

    await queryInterface.createTable('working_time', {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true
      },

      working_days: {
        type: Sequelize.ARRAY(Sequelize.TEXT),
        allowNull: false,
        defaultValue: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday']
      },

      start_time: {
        type: Sequelize.TIME,
        allowNull: false,
        defaultValue: '08:00:00'
      },

      end_time: {
        type: Sequelize.TIME,
        allowNull: false,
        defaultValue: '17:00:00'
      },

      break_start: {
        type: Sequelize.TIME,
        allowNull: true
      },

      break_end: {
        type: Sequelize.TIME,
        allowNull: true
      },

      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.fn('now')
      },

      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.fn('now')
      }
    });
  }
};
