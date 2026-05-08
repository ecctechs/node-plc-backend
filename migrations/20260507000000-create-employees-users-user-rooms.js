'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const transaction = await queryInterface.sequelize.transaction();
    try {
      const tables = await queryInterface.showAllTables();

      if (!tables.includes('employees')) {
        await queryInterface.createTable('employees', {
          id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true, allowNull: false },
          employee_id: { type: Sequelize.STRING(50), allowNull: false, unique: true },
          first_name: { type: Sequelize.STRING(100), allowNull: false },
          last_name: { type: Sequelize.STRING(100), allowNull: false },
          department: { type: Sequelize.STRING(100), allowNull: true },
          phone: { type: Sequelize.STRING(20), allowNull: true },
          is_active: { type: Sequelize.BOOLEAN, allowNull: false, defaultValue: true },
          created_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('NOW()') },
          updated_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('NOW()') }
        }, { transaction });
      }

      if (!tables.includes('users')) {
        await queryInterface.createTable('users', {
          id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true, allowNull: false },
          email: { type: Sequelize.STRING(255), allowNull: false, unique: true },
          password_hash: { type: Sequelize.TEXT, allowNull: false },
          role: { type: Sequelize.STRING(20), allowNull: false },
          is_active: { type: Sequelize.BOOLEAN, allowNull: false, defaultValue: true },
          employee_id: { type: Sequelize.INTEGER, allowNull: true, references: { model: 'employees', key: 'id' }, onDelete: 'SET NULL', onUpdate: 'CASCADE' },
          created_by: { type: Sequelize.INTEGER, allowNull: true, references: { model: 'users', key: 'id' }, onDelete: 'SET NULL', onUpdate: 'CASCADE' },
          last_login_at: { type: Sequelize.DATE, allowNull: true },
          created_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('NOW()') },
          updated_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('NOW()') }
        }, { transaction });

        await queryInterface.addConstraint('users', {
          type: 'check',
          fields: ['role'],
          where: {
            role: ['super_admin', 'admin', 'operator', 'viewer', 'guest']
          },
          name: 'users_role_check',
          transaction
        });
      }

      if (!tables.includes('user_rooms')) {
        await queryInterface.createTable('user_rooms', {
          user_id: { type: Sequelize.INTEGER, allowNull: false, references: { model: 'users', key: 'id' }, onDelete: 'CASCADE', onUpdate: 'CASCADE' },
          room_id: { type: Sequelize.INTEGER, allowNull: false, references: { model: 'rooms', key: 'id' }, onDelete: 'CASCADE', onUpdate: 'CASCADE' },
          scope: { type: Sequelize.STRING(10), allowNull: false, defaultValue: 'view' },
          assigned_by: { type: Sequelize.INTEGER, allowNull: true, references: { model: 'users', key: 'id' }, onDelete: 'SET NULL', onUpdate: 'CASCADE' },
          assigned_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('NOW()') }
        }, { transaction });

        await queryInterface.addConstraint('user_rooms', {
          type: 'primary key',
          fields: ['user_id', 'room_id'],
          name: 'user_rooms_pkey',
          transaction
        });

        await queryInterface.addConstraint('user_rooms', {
          type: 'check',
          fields: ['scope'],
          where: {
            scope: ['view', 'control', 'manage']
          },
          name: 'user_rooms_scope_check',
          transaction
        });
      }

      await transaction.commit();
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  },

  down: async (queryInterface, Sequelize) => {
    const transaction = await queryInterface.sequelize.transaction();
    try {
      const tables = await queryInterface.showAllTables();

      if (tables.includes('user_rooms')) {
        await queryInterface.dropTable('user_rooms', { transaction });
      }
      if (tables.includes('users')) {
        await queryInterface.dropTable('users', { transaction });
      }
      if (tables.includes('employees')) {
        await queryInterface.dropTable('employees', { transaction });
      }

      await transaction.commit();
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }
};
