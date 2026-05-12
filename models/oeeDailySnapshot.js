'use strict';

const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class OeeDailySnapshot extends Model {
    static associate(models) {
      OeeDailySnapshot.belongsTo(models.Product, {
        foreignKey: 'product_id',
        as: 'product'
      });
    }
  }

  OeeDailySnapshot.init({
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
    snapshot_date: {
      type: DataTypes.DATEONLY,
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
    modelName: 'OeeDailySnapshot',
    tableName: 'oee_daily_snapshots',
    timestamps: false,
    indexes: [
      {
        unique: true,
        fields: ['product_id', 'snapshot_date'],
        name: 'unique_product_date'
      }
    ]
  });

  return OeeDailySnapshot;
};
