'use strict';

module.exports = (sequelize, DataTypes) => {
  const DeviceAlarmState = sequelize.define(
    'DeviceAlarmState',
    {
      device_id: {
        type: DataTypes.INTEGER,
        allowNull: false
      },
      // เพิ่มให้สอดคล้องกับ Migration
      address_id: {
        type: DataTypes.INTEGER,
        allowNull: false
      },
      alarm_rule_id: {
        type: DataTypes.INTEGER,
        allowNull: false
      },
      is_active: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false
      },
      last_triggered_at: {
        type: DataTypes.DATE,
        allowNull: true
      },
      last_value: {
        type: DataTypes.FLOAT,
        allowNull: true
      }
    },
    {
      tableName: 'device_alarm_states',
      underscored: true,
      timestamps: true
    }
  );

  DeviceAlarmState.associate = (models) => {
    // เชื่อมกับ Device หลัก
    DeviceAlarmState.belongsTo(models.Device, {
        foreignKey: 'device_id',
        as: 'device'
    });

    // เชื่อมกับ Address (Sensor/Register)
    DeviceAlarmState.belongsTo(models.DeviceAddress, { 
        foreignKey: 'address_id', 
        as: 'address' 
    });

    // เชื่อมกับกฎการแจ้งเตือน
    DeviceAlarmState.belongsTo(models.DeviceAlarmRule, {
      foreignKey: 'alarm_rule_id',
      as: 'rule'
    });
  };

  return DeviceAlarmState;
};