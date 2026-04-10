module.exports = (sequelize, DataTypes) => {
  const DeviceType = sequelize.define('DeviceType', {
    name: { type: DataTypes.TEXT, allowNull: false, unique: true },
    description: { type: DataTypes.TEXT },
    display_types: { type: DataTypes.JSON, defaultValue: ['onoff', 'number', 'number_gauge', 'level'] },
    is_active: { type: DataTypes.BOOLEAN, defaultValue: true }
  }, {
    tableName: 'device_types',
    underscored: true
  });

  DeviceType.associate = (models) => {
    DeviceType.hasMany(models.Device, { as: 'devices', foreignKey: 'device_type_id' });
  };

  return DeviceType;
};
