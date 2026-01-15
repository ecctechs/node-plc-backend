module.exports = (sequelize, DataTypes) => {
  const Device = sequelize.define('Device', {
    name: {
      type: DataTypes.TEXT,
      allowNull: false
    },

    device_type: {
      type: DataTypes.TEXT,
      allowNull: false
    },

    data_display_type: {
      type: DataTypes.TEXT,
      allowNull: false,
      defaultValue: 'onoff'
    },

    plc_address: {
      type: DataTypes.TEXT,
      allowNull: false
    },

    refresh_rate_ms: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 1000
    },

    is_active: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true
    },

    last_seen_at: {
      type: DataTypes.DATE,
      allowNull: true
    },

    last_error_at: {
      type: DataTypes.DATE,
      allowNull: true
    },
    last_value: {
      type: DataTypes.FLOAT,
      allowNull: true
    },
    
  }, {
    tableName: 'devices',
    underscored: true,
    timestamps: true
  });

    Device.associate = (models) => {
    // ⭐ Device → Number Config (1:1)
    Device.hasOne(models.DeviceNumberConfig, {
      foreignKey: 'device_id',
      as: 'numberConfig',
      onDelete: 'CASCADE'
    });

    // (ของเดิมที่คุณมี)
    Device.hasMany(models.DeviceLog, {
      foreignKey: 'device_id',
      as: 'logs'
    });

    Device.hasMany(models.DeviceConnectionLog, {
      foreignKey: 'device_id',
      as: 'connectionLogs'
    });
  };

  return Device;
};
