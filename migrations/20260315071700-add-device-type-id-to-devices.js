'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    // Add device_type_id column
    await queryInterface.addColumn('devices', 'device_type_id', {
      type: Sequelize.INTEGER,
      allowNull: true,
      references: {
        model: 'device_types',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL'
    });

    // Migrate existing device_type text to device_type_id based on device_types table
    // This will match device_type (text) to device_types.name and set the corresponding id
    await queryInterface.sequelize.query(`
      UPDATE devices 
      SET device_type_id = (
        SELECT id FROM device_types 
        WHERE LOWER(device_types.name) = LOWER(devices.device_type)
        LIMIT 1
      )
      WHERE device_type IS NOT NULL
    `);

    // Drop the old device_type column
    await queryInterface.removeColumn('devices', 'device_type');
  },

  async down(queryInterface, Sequelize) {
    // Add back device_type column
    await queryInterface.addColumn('devices', 'device_type', {
      type: Sequelize.TEXT,
      allowNull: true
    });

    // Migrate device_type_id back to device_type text
    await queryInterface.sequelize.query(`
      UPDATE devices 
      SET device_type = (
        SELECT name FROM device_types 
        WHERE device_types.id = devices.device_type_id
      )
      WHERE device_type_id IS NOT NULL
    `);

    // Remove device_type_id column
    await queryInterface.removeColumn('devices', 'device_type_id');
  }
};
