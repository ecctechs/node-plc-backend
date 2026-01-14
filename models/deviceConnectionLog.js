module.exports = (sequelize, DataTypes) => {
  return sequelize.define(
    'DeviceConnectionLog',
    {
      device_id: {                    // ⭐ สำคัญมาก
        type: DataTypes.INTEGER,
        allowNull: false
      },

      status: {
        type: DataTypes.ENUM('connected', 'disconnected'),
        allowNull: false
      }
    },
    {
      tableName: 'device_connection_logs',
      timestamps: false,
      createdAt: 'created_at'
    }
  );
};
