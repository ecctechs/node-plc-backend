// models/deviceAlarmRule.js
'use strict';

module.exports = (sequelize, DataTypes) => {
  const DeviceAlarmRule = sequelize.define(
    'DeviceAlarmRule',
    {
      device_id: {
        type: DataTypes.INTEGER,
        allowNull: false
      },

      name: {
        type: DataTypes.STRING,
        allowNull: false
      },

      data_type: {
        type: DataTypes.STRING, // onoff | number | level
        allowNull: false
      },

      condition_type: {
        type: DataTypes.STRING, // EXACT | MT | MTE | LT | LTE | BTW | LEVEL
        allowNull: false
      },

      min_value: {
        type: DataTypes.FLOAT,
        allowNull: true
      },

      max_value: {
        type: DataTypes.FLOAT,
        allowNull: true
      },

      level_index: {
        type: DataTypes.INTEGER,
        allowNull: true
      },

      duration_sec: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0
      },

      repeat_interval_sec: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 900
      },

      severity: {
        type: DataTypes.STRING, // info | warning | critical
        allowNull: false,
        defaultValue: 'warning'
      },

      notify_email: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true
      },

      email_recipients: {
        type: DataTypes.ARRAY(DataTypes.STRING),
        allowNull: true
      },

      is_active: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true
      }
    },
    {
      tableName: 'device_alarm_rules',
      underscored: true,
      timestamps: true
    }
  );

  DeviceAlarmRule.associate = (models) => {
    DeviceAlarmRule.belongsTo(models.Device, {
      foreignKey: 'device_id',
      as: 'device'
    });

    DeviceAlarmRule.hasOne(models.DeviceAlarmState, {
      foreignKey: 'alarm_rule_id',
      as: 'state',
      onDelete: 'CASCADE'
    });

    DeviceAlarmRule.hasMany(models.DeviceAlarmEvent, {
      foreignKey: 'alarm_rule_id',
      as: 'events',
      onDelete: 'CASCADE'
    });
  };

  return DeviceAlarmRule;
};