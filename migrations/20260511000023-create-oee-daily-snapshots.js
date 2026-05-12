'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('oee_daily_snapshots', {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false
      },
      product_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'products', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      snapshot_date: {
        type: Sequelize.DATEONLY,
        allowNull: false
      },
      oee: {
        type: Sequelize.DECIMAL(5, 2),
        allowNull: false,
        defaultValue: 0
      },
      availability: {
        type: Sequelize.DECIMAL(5, 2),
        allowNull: false,
        defaultValue: 0
      },
      performance: {
        type: Sequelize.DECIMAL(5, 2),
        allowNull: false,
        defaultValue: 0
      },
      quality: {
        type: Sequelize.DECIMAL(5, 2),
        allowNull: false,
        defaultValue: 0
      },
      total_output: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0
      },
      total_reject: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0
      },
      downtime_min: {
        type: Sequelize.DECIMAL(8, 2),
        allowNull: false,
        defaultValue: 0
      },
      planned_min: {
        type: Sequelize.DECIMAL(8, 2),
        allowNull: false,
        defaultValue: 0
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      }
    });

    await queryInterface.addConstraint('oee_daily_snapshots', {
      fields: ['product_id', 'snapshot_date'],
      type: 'unique',
      name: 'unique_product_date'
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('oee_daily_snapshots');
  }
};
