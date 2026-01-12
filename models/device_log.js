module.exports = (sequelize, DataTypes) => {
  const DeviceLog = sequelize.define('DeviceLog', {
    device_name: DataTypes.TEXT,
    data_type: DataTypes.TEXT,
    address: DataTypes.TEXT,
    action: DataTypes.TEXT,
    value: DataTypes.TEXT,
    created_at: DataTypes.DATE
  }, {
    tableName: 'device_logs',
    timestamps: false,
    underscored: true
  });

  return DeviceLog;
};
