'use strict';

const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class DowntimeLog extends Model {
    static associate(models) {
      DowntimeLog.belongsTo(models.Device, { foreignKey: 'device_id', as: 'device' });
      DowntimeLog.belongsTo(models.DeviceAddress, { foreignKey: 'address_id', as: 'address' });
    }
  }

  DowntimeLog.init({
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
      allowNull: false
    },
    device_id: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    address_id: {
      type: DataTypes.INTEGER,
      allowNull: true
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
    modelName: 'DowntimeLog',
    tableName: 'downtime_logs',
    timestamps: false
  });

  return DowntimeLog;
};