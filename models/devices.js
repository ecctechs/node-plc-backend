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
      type: DataTypes.BOOLEAN,
      allowNull: true
    },
    
  }, {
    tableName: 'devices',
    underscored: true,
    timestamps: true
  });

  return Device;
};
