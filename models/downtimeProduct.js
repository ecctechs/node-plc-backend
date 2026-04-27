'use strict';

const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class DowntimeProduct extends Model {
    static associate(models) {
      DowntimeProduct.belongsTo(models.Product, { foreignKey: 'product_id', as: 'product' });
    }
  }

  DowntimeProduct.init({
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
    event_type: {
      type: DataTypes.STRING(20),
      allowNull: false,
      comment: 'START=เริ่มหยุด, END=กลับมารัน'
    },
    reason: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    created_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW
    }
  }, {
    sequelize,
    modelName: 'DowntimeProduct',
    tableName: 'downtime_products',
    timestamps: false
  });

  return DowntimeProduct;
};