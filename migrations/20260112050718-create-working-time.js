'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    
    await queryInterface.createTable('working_time', {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true
      },

      working_days: {
        type: Sequelize.ARRAY(Sequelize.TEXT),
        allowNull: false
      },

      start_time: {
        type: Sequelize.TIME,
        allowNull: false
      },

      end_time: {
        type: Sequelize.TIME,
        allowNull: false
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
  },

  async down(queryInterface, Sequelize) {
    // rollback แค่ drop table ก็พอ
    await queryInterface.dropTable('working_time');
  }
};
