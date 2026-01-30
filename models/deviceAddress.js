module.exports = (sequelize, DataTypes) => {
  const DeviceAddress = sequelize.define('DeviceAddress', {
    plc_address: { type: DataTypes.TEXT, allowNull: false },
    label: { type: DataTypes.TEXT },
    data_type: { type: DataTypes.TEXT, defaultValue: 'onoff' },
    last_value: { type: DataTypes.FLOAT }
  }, { 
    tableName: 'device_addresses', 
    underscored: true 
  });

  DeviceAddress.associate = (models) => {
    DeviceAddress.belongsTo(models.Device, { foreignKey: 'device_id', as: 'device' });
    
    // ⭐ ย้ายความสัมพันธ์จาก Device มาเกาะที่นี่แทน
    DeviceAddress.hasOne(models.DeviceNumberConfig, { as: 'numberConfig', foreignKey: 'address_id' });
    DeviceAddress.hasMany(models.DeviceLevelConfig, { as: 'levels', foreignKey: 'address_id' });
    DeviceAddress.hasMany(models.DeviceLog, { as: 'logs', foreignKey: 'address_id' });
    DeviceAddress.hasMany(models.DeviceAlarmRule, { as: 'alarmRules', foreignKey: 'address_id' });
  };
  return DeviceAddress;
};