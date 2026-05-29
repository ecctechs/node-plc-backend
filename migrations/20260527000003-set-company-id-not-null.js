'use strict';

const TABLES = [
  'rooms',
  'device_types',
  'devices',
  'products',
  'employees',
  'working_time',
  'dashboard_cards',
  'interaction_layouts',
  'oee_daily_snapshots',
  'oee_hourly_snapshots',
];

module.exports = {
  async up(queryInterface, Sequelize) {
    for (const table of TABLES) {
      await queryInterface.changeColumn(table, 'company_id', {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'companies', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT',
      });
    }
  },

  async down(queryInterface, Sequelize) {
    for (const table of TABLES) {
      await queryInterface.changeColumn(table, 'company_id', {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: { model: 'companies', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
      });
    }
  },
};
