'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('device_types', {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false
      },

      name: {
        type: Sequelize.TEXT,
        allowNull: false,
        unique: true
      },

      description: {
        type: Sequelize.TEXT,
        allowNull: true
      },

      display_types: {
        type: Sequelize.JSON,
        allowNull: true,
        defaultValue: ['onoff', 'number', 'number_gauge', 'level']
      },

      is_active: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true
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

    // Insert default device types
    await queryInterface.bulkInsert('device_types', [
      { name: 'Lamp', description: 'Lamp device', is_active: true, created_at: new Date(), updated_at: new Date() },
      { name: 'Pump', description: 'Pump device', is_active: true, created_at: new Date(), updated_at: new Date() },
      { name: 'Motor', description: 'Motor device', is_active: true, created_at: new Date(), updated_at: new Date() },
      { name: 'Inkjet', description: 'Inkjet device', is_active: true, created_at: new Date(), updated_at: new Date() },
    ]);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('device_types');
  }
};
