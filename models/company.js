'use strict';

const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Company extends Model {
    static associate(models) {
      Company.hasMany(models.User, { foreignKey: 'company_id', as: 'users' });
      Company.hasMany(models.Role, { foreignKey: 'company_id', as: 'roles' });
      Company.hasMany(models.Room, { foreignKey: 'company_id', as: 'rooms' });
      Company.hasMany(models.DeviceType, { foreignKey: 'company_id', as: 'deviceTypes' });
      Company.hasMany(models.Device, { foreignKey: 'company_id', as: 'devices' });
      Company.hasMany(models.Product, { foreignKey: 'company_id', as: 'products' });
      Company.hasMany(models.Employee, { foreignKey: 'company_id', as: 'employees' });
      Company.hasMany(models.WorkingTime, { foreignKey: 'company_id', as: 'workingTimes' });
      Company.hasMany(models.DashboardCard, { foreignKey: 'company_id', as: 'dashboardCards' });
      Company.hasMany(models.InteractionLayout, { foreignKey: 'company_id', as: 'interactionLayouts' });
      Company.hasMany(models.OeeDailySnapshot, { foreignKey: 'company_id', as: 'oeeDailySnapshots' });
      Company.hasMany(models.OeeHourlySnapshot, { foreignKey: 'company_id', as: 'oeeHourlySnapshots' });
    }
  }

  Company.init({
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
      allowNull: false
    },
    name: {
      type: DataTypes.STRING(255),
      allowNull: false,
      unique: true
    },
    is_active: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true
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
    modelName: 'Company',
    tableName: 'companies',
    timestamps: false
  });

  return Company;
};
