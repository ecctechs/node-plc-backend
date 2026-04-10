'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('devices', 'room_id', {
      type: Sequelize.INTEGER,
      allowNull: true,
      references: {
        model: 'rooms',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL'
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('devices', 'room_id');
  }
};
