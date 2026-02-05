module.exports = (sequelize, DataTypes) => {
  const Device = sequelize.define('Device', {
    name: { type: DataTypes.TEXT, allowNull: false },
    device_type: { type: DataTypes.TEXT, allowNull: false },
    refresh_rate_ms: { type: DataTypes.INTEGER, defaultValue: 1000 },
    last_seen_at: { type: DataTypes.DATE },
    last_error_at: { type: DataTypes.DATE },
    is_active: { type: DataTypes.BOOLEAN, defaultValue: true }
  }, { 
    tableName: 'devices', 
    underscored: true 
  });

  Device.associate = (models) => {

    // ⭐ Device -> Addresses
    Device.hasMany(models.DeviceAddress, { 
      as: 'addresses', 
      foreignKey: 'device_id',
      onDelete: 'CASCADE'
    });

    // ⭐ Device -> Connection Logs
    Device.hasMany(models.DeviceConnectionLog, {
      as: 'connectionLogs',
      foreignKey: 'device_id'
    });
  };

  return Device;
};
