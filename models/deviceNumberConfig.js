'use strict';

module.exports = (sequelize, DataTypes) => {
  const DeviceNumberConfig = sequelize.define('DeviceNumberConfig', {
    address_id: { type: DataTypes.INTEGER, allowNull: false },
    decimal_places: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
    scale: { type: DataTypes.FLOAT, allowNull: false, defaultValue: 1 },
    offset: { type: DataTypes.FLOAT, allowNull: false, defaultValue: 0 },
    min_value: { type: DataTypes.FLOAT, allowNull: true },
    max_value: { type: DataTypes.FLOAT, allowNull: true },
    unit: { type: DataTypes.STRING, allowNull: true }
  }, {
    tableName: 'device_number_configs',
    underscored: true,
    timestamps: true
  });

  DeviceNumberConfig.associate = (models) => {
    DeviceNumberConfig.belongsTo(models.DeviceAddress, { foreignKey: 'address_id', as: 'address' });
  };

  return DeviceNumberConfig;
};
