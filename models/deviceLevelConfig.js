'use strict';

module.exports = (sequelize, DataTypes) => {
  const DeviceLevelConfig = sequelize.define(
    'DeviceLevelConfig',
    {
      device_id: {
        type: DataTypes.INTEGER,
        allowNull: false
      },

      level_index: {
        type: DataTypes.INTEGER,
        allowNull: false
      },

      label: {
        type: DataTypes.STRING,
        allowNull: false
      },

      condition_type: {
        type: DataTypes.STRING,
        allowNull: false
      },

      min_value: {
        type: DataTypes.FLOAT,
        allowNull: true
      },

      max_value: {
        type: DataTypes.FLOAT,
        allowNull: true
      },

      include_min: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
      },

      include_max: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
      }
    },
    {
      tableName: 'device_level_configs', // ⭐ ชื่อตารางที่ถูกต้อง
      underscored: true,
      timestamps: true
    }
  );

  DeviceLevelConfig.associate = (models) => {
    DeviceLevelConfig.belongsTo(models.Device, {
      foreignKey: 'device_id',
      as: 'device',
      onDelete: 'CASCADE'
    });
  };

  return DeviceLevelConfig;
};
