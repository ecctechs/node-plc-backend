module.exports = (sequelize, DataTypes) => {
  const Device = sequelize.define('Device', {
    name: { type: DataTypes.TEXT, allowNull: false },
    device_type: { type: DataTypes.TEXT, allowNull: false },
    refresh_rate_ms: { type: DataTypes.INTEGER, defaultValue: 1000 },
    last_seen_at: { type: DataTypes.DATE },
    last_error_at: { type: DataTypes.DATE },
    is_active: { type: DataTypes.BOOLEAN, defaultValue: true }
    // ❌ ลบ plc_address, data_display_type, last_value ออกแล้ว
  }, { 
    tableName: 'devices', 
    underscored: true 
  });

  Device.associate = (models) => {
    // ⭐ หัวใจหลัก: 1 เครื่อง มีได้หลาย Address
    Device.hasMany(models.DeviceAddress, { 
      as: 'addresses', 
      foreignKey: 'device_id',
      onDelete: 'CASCADE' 
    });
    Device.hasMany(models.DeviceConnectionLog, { as: 'connectionLogs', foreignKey: 'device_id' });
  };
  return Device;
};