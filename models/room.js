module.exports = (sequelize, DataTypes) => {
  const Room = sequelize.define('Room', {
    name: { type: DataTypes.TEXT, allowNull: false, unique: true },
    is_active: { type: DataTypes.BOOLEAN, defaultValue: true }
  }, {
    tableName: 'rooms',
    underscored: true
  });

  Room.associate = (models) => {
    Room.hasMany(models.Device, { as: 'devices', foreignKey: 'room_id' });
    Room.hasMany(models.UserRoom, { as: 'userRooms', foreignKey: 'room_id' });
    Room.belongsToMany(models.User, {
      through: models.UserRoom,
      foreignKey: 'room_id',
      otherKey: 'user_id',
      as: 'users'
    });
  };

  return Room;
};
