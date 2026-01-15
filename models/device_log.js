module.exports = (sequelize, DataTypes) => {
  const DeviceLog = sequelize.define('DeviceLog', {
    value: {
      type: DataTypes.FLOAT,
      allowNull: false
    }
  }, {
    tableName: 'device_logs',
    underscored: true,
    timestamps: false
  });

  DeviceLog.associate = (models) => {
    DeviceLog.belongsTo(models.Device, {
      foreignKey: 'device_id'
    });
  };

  return DeviceLog;
};
