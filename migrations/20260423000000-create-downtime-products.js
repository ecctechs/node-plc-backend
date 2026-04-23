'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('downtime_products', {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false
      },

      product_id: {
        type: Sequelize.INTEGER,
        allowNull: false
      },

      event_type: {
        type: Sequelize.STRING(20),
        allowNull: false,
        comment: 'START=เริ่มหยุด, END=กลับมารัน'
      },

      reason: {
        type: Sequelize.STRING(255),
        allowNull: true
      },

      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.fn('now')
      }
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('downtime_products');
  }
};