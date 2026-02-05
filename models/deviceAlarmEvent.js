'use strict';

module.exports = (sequelize, DataTypes) => {
  const DeviceAlarmEvent = sequelize.define(
    'DeviceAlarmEvent',
    {
      device_id: {
        type: DataTypes.INTEGER,
        allowNull: false // เปลี่ยนเป็น false เพื่อความสมบูรณ์ของข้อมูล
      },
      // เพิ่ม address_id เพื่อให้สอดคล้องกับโครงสร้างระบบใหม่
      address_id: {
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
      },
      // เพิ่ม timestamps: false ตามเดิม แต่ใน DB จะมี created_at อัตโนมัติ
      created_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
      }
    },
    {
      tableName: 'device_alarm_events',
      underscored: true,
      timestamps: false // ใช้เฉพาะ created_at
    }
  );

  DeviceAlarmEvent.associate = (models) => {
    DeviceAlarmEvent.belongsTo(models.Device, {
      foreignKey: 'device_id',
      as: 'device'
    });

    // เชื่อมกับ Address (Sensor/Register)
    DeviceAlarmEvent.belongsTo(models.DeviceAddress, {
      foreignKey: 'address_id',
      as: 'address'
    });

    DeviceAlarmEvent.belongsTo(models.DeviceAlarmRule, {
      foreignKey: 'alarm_rule_id',
      as: 'rule'
    });
  };

  return DeviceAlarmEvent;
};