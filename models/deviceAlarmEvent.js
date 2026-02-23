'use strict';

module.exports = (sequelize, DataTypes) => {
  const DeviceAlarmEvent = sequelize.define('DeviceAlarmEvent', {
    device_id: { type: DataTypes.INTEGER, allowNull: false },
    address_id: { type: DataTypes.INTEGER, allowNull: false },
    alarm_rule_id: { type: DataTypes.INTEGER, allowNull: false },
    event_type: { type: DataTypes.STRING, allowNull: false }, // TRIGGER | RECOVER
    value: { type: DataTypes.FLOAT, allowNull: true },
    created_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW }
  }, {
    tableName: 'device_alarm_events',
    underscored: true,
    timestamps: false
  });

  DeviceAlarmEvent.associate = (models) => {
    DeviceAlarmEvent.belongsTo(models.Device, { foreignKey: 'device_id', as: 'device' });
    DeviceAlarmEvent.belongsTo(models.DeviceAddress, { foreignKey: 'address_id', as: 'address' });
    DeviceAlarmEvent.belongsTo(models.DeviceAlarmRule, { foreignKey: 'alarm_rule_id', as: 'rule' });
  };

  return DeviceAlarmEvent;
};
