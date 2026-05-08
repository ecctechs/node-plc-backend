'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('user_rooms', {
      id: {
        allowNull: false,
        autoIncrement: true,
        type: Sequelize.INTEGER
      },
      user_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'users', // ชื่อตารางปลายทาง (ปกติ Sequelize จะเติม s)
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      room_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'rooms', 
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
      },
      scope: {
        type: Sequelize.STRING(10),
        allowNull: false,
        defaultValue: 'view'
      },
      assigned_by: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'users',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
      },
      assigned_at: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      }
    });

    // แนะนำ: เพิ่ม Index เพื่อความเร็วในการ Query
    await queryInterface.addIndex('user_rooms', ['user_id']);
    await queryInterface.addIndex('user_rooms', ['room_id']);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('user_rooms');
  }
};