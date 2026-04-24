'use strict';

const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class ProductLog extends Model {
    static associate(models) {
      // define association here
      ProductLog.belongsTo(models.Product, { foreignKey: 'product_id', as: 'product' });
    }
  }

  ProductLog.init({
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
      allowNull: false
    },
    product_id: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    plc_onoff_value: {
      type: DataTypes.FLOAT,
      allowNull: true
    },
    plc_active_value: {
      type: DataTypes.FLOAT,
      allowNull: true
    },
    plc_complete_value: {
      type: DataTypes.FLOAT,
      allowNull: true
    },
    created_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW
    }
  }, {
    sequelize,
    modelName: 'ProductLog',
    tableName: 'product_logs',
    timestamps: false
  });

  return ProductLog;
};