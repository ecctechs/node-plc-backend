'use strict';
module.exports = (sequelize, DataTypes) => {
  const DeviceLevelConfig = sequelize.define('DeviceLevelConfig', {
    address_id: { type: DataTypes.INTEGER, allowNull: false },
    level_index: { type: DataTypes.INTEGER, defaultValue: 0 },
    label: { type: DataTypes.TEXT, allowNull: false },
    condition_type: { type: DataTypes.TEXT, allowNull: false }, // LTE, GTE, BTW
    min_value: { type: DataTypes.FLOAT, allowNull: true },
    max_value: { type: DataTypes.FLOAT, allowNull: true },
    mode: { type: DataTypes.TEXT, defaultValue: 'range' }, // range | exact
    exact_values: { type: DataTypes.ARRAY(DataTypes.INTEGER), allowNull: true, defaultValue: [] },
    include_min: { type: DataTypes.BOOLEAN, defaultValue: true },
    include_max: { type: DataTypes.BOOLEAN, defaultValue: true },
  }, {
    tableName: 'device_level_configs',
    underscored: true
  });

  DeviceLevelConfig.associate = (models) => {
    DeviceLevelConfig.belongsTo(models.DeviceAddress, { foreignKey: 'address_id', as: 'address' });
  };
  return DeviceLevelConfig;
};
