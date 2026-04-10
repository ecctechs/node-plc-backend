module.exports = (sequelize, DataTypes) => {
  const Device = sequelize.define('Device', {
    name: { type: DataTypes.TEXT, allowNull: false },
    device_type_id: { type: DataTypes.INTEGER },
    room_id: { type: DataTypes.INTEGER },
    refresh_rate_ms: { type: DataTypes.INTEGER, defaultValue: 1000 },
    last_seen_at: { type: DataTypes.DATE },
    last_error_at: { type: DataTypes.DATE },
    is_active: { type: DataTypes.BOOLEAN, defaultValue: true }
  }, {
    tableName: 'devices',
    underscored: true
  });

  Device.associate = (models) => {
    Device.hasMany(models.DeviceAddress, { as: 'addresses', foreignKey: 'device_id', onDelete: 'CASCADE' });
    Device.hasMany(models.DeviceConnectionLog, { as: 'connectionLogs', foreignKey: 'device_id' });
    Device.hasMany(models.DeviceAlarmRule, { as: 'alarmRules', foreignKey: 'device_id', onDelete: 'CASCADE' });
    Device.belongsTo(models.Room, { foreignKey: 'room_id', as: 'room' });
    Device.belongsTo(models.DeviceType, { foreignKey: 'device_type_id', as: 'deviceType' });
  };

  return Device;
};
