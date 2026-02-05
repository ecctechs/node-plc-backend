module.exports = (sequelize, DataTypes) => {
  const DeviceAddress = sequelize.define('DeviceAddress', {
    device_id: DataTypes.INTEGER,
    plc_address: DataTypes.STRING,
    label: DataTypes.STRING,
    data_type: DataTypes.STRING,
    last_value: DataTypes.FLOAT,
    is_connected: {           
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    updated_at: DataTypes.DATE(3),
    refresh_rate_ms:DataTypes.INTEGER
  }, {
    tableName: 'device_addresses',
    underscored: true
  });

  DeviceAddress.associate = (models) => {

    DeviceAddress.belongsTo(models.Device, {
      foreignKey: 'device_id',
       as: 'device'
    });

    DeviceAddress.hasOne(models.DeviceNumberConfig, {
      as: 'numberConfig',
      foreignKey: 'address_id',
      onDelete: 'CASCADE'
    });

    DeviceAddress.hasMany(models.DeviceLevelConfig, {
      as: 'levels',
      foreignKey: 'address_id',
      onDelete: 'CASCADE'
    });

    DeviceAddress.hasMany(models.DeviceAlarmRule, {
      as: 'alarms',
      foreignKey: 'address_id',
      onDelete: 'CASCADE'
    });
    

    DeviceAddress.hasMany(models.DeviceLog, { as: 'logs', foreignKey: 'address_id' });
  };

  return DeviceAddress;
};


