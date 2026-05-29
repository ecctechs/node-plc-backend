'use strict';

const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Employee extends Model {
    static associate(models) {
      Employee.hasMany(models.User, { foreignKey: 'employee_id', as: 'users' });
      Employee.belongsTo(models.Company, { foreignKey: 'company_id', as: 'company' });
    }
  }

  Employee.init({
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
      allowNull: false
    },
    employee_id: {
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: true
    },
    first_name: {
      type: DataTypes.STRING(100),
      allowNull: false
    },
    last_name: {
      type: DataTypes.STRING(100),
      allowNull: false
    },
    department: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    position: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    phone: {
      type: DataTypes.STRING(20),
      allowNull: true
    },
    is_active: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true
    },
    company_id: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    created_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW
    },
    updated_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW
    }
  }, {
    sequelize,
    modelName: 'Employee',
    tableName: 'employees',
    timestamps: false
  });

  return Employee;
};
