// models/deviceAlarmEvent.js
'use strict';

module.exports = (sequelize, DataTypes) => {
  const DeviceAlarmEvent = sequelize.define(
    'DeviceAlarmEvent',
    {
      device_id: {
        type: DataTypes.INTEGER,
        allowNull: false
      },

      alarm_rule_id: {
        type: DataTypes.INTEGER,
        allowNull: false
      },

      event_type: {
        type: DataTypes.STRING, // TRIGGER | RECOVER
        allowNull: false
      },

      value: {
        type: DataTypes.FLOAT,
        allowNull: true
      }
    },
    {
      tableName: 'device_alarm_events',
      underscored: true,
      timestamps: false
    }
  );

  DeviceAlarmEvent.associate = (models) => {
    DeviceAlarmEvent.belongsTo(models.Device, {
      foreignKey: 'device_id',
      as: 'device'
    });

    DeviceAlarmEvent.belongsTo(models.DeviceAlarmRule, {
      foreignKey: 'alarm_rule_id',
      as: 'rule'
    });
  };

  return DeviceAlarmEvent;
};
