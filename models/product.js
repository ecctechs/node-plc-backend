'use strict';

const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Product extends Model {
    static associate(models) {
    }
  }

  Product.init({
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
      allowNull: false
    },
    name: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    image_path: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    cycle_time: {
      type: DataTypes.FLOAT,
      allowNull: true,
      comment: 'Cycle time in seconds'
    },
    plc_address_output: {
      type: DataTypes.STRING(100),
      allowNull: true,
      comment: 'PLC Address for count signal (ON/OFF)'
    },
    plc_address_active: {
      type: DataTypes.STRING(100),
      allowNull: true,
      comment: 'PLC Address for running status signal'
    },
    total_output: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: 0,
      comment: 'Total output count'
    },
    plc_address_complete: {
      type: DataTypes.STRING(100),
      allowNull: true,
      comment: 'PLC Address for complete signal'
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
    modelName: 'Product',
    tableName: 'products',
    timestamps: false
  });

  return Product;
};