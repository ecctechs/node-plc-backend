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
      await queryInterface.addColumn(table, 'company_id', {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: { model: 'companies', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
      });
    }
  },

  async down(queryInterface) {
    for (const table of TABLES) {
      await queryInterface.removeColumn(table, 'company_id');
    }
  },
};
