'use strict';

const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class OeeHourlySnapshot extends Model {
    static associate(models) {
      OeeHourlySnapshot.belongsTo(models.Product, {
        foreignKey: 'product_id',
        as: 'product'
      });
    }
  }

  OeeHourlySnapshot.init({
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
    snapshot_hour: {
      type: DataTypes.DATE,
      allowNull: false
    },
    oee: {
      type: DataTypes.DECIMAL(5, 2),
      allowNull: false,
      defaultValue: 0
    },
    availability: {
      type: DataTypes.DECIMAL(5, 2),
      allowNull: false,
      defaultValue: 0
    },
    performance: {
      type: DataTypes.DECIMAL(5, 2),
      allowNull: false,
      defaultValue: 0
    },
    quality: {
      type: DataTypes.DECIMAL(5, 2),
      allowNull: false,
      defaultValue: 0
    },
    total_output: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0
    },
    total_reject: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0
    },
    downtime_min: {
      type: DataTypes.DECIMAL(8, 2),
      allowNull: false,
      defaultValue: 0
    },
    planned_min: {
      type: DataTypes.DECIMAL(8, 2),
      allowNull: false,
      defaultValue: 0
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
    modelName: 'OeeHourlySnapshot',
    tableName: 'oee_hourly_snapshots',
    timestamps: false,
    indexes: [
      {
        unique: true,
        fields: ['product_id', 'snapshot_hour'],
        name: 'unique_product_hour'
      }
    ]
  });

  return OeeHourlySnapshot;
};
