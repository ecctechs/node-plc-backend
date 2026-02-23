module.exports = (sequelize, DataTypes) => {
  const DeviceLog = sequelize.define('DeviceLog', {
    // Raw value (Float supports both M coil and D register)
    value: {
      type: DataTypes.FLOAT,
      allowNull: true
    },

    // Connection quality: 1=Good, 0=Bad/Link Down
    status: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 1,
      comment: '1=Good, 0=Bad/Link Down'
    },

    // Millisecond-precision timestamp
    created_at: {
      type: DataTypes.DATE(3),
      defaultValue: DataTypes.NOW,
      field: 'created_at'
    }
  }, {
    tableName: 'device_logs',
    underscored: true,
    timestamps: false,
    indexes: [
      { fields: ['address_id', 'created_at'] }
    ]
  });

  DeviceLog.associate = (models) => {
    DeviceLog.belongsTo(models.DeviceAddress, { foreignKey: 'address_id', as: 'address' });
  };

  return DeviceLog;
};
