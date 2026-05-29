module.exports = (sequelize, DataTypes) => {
  const Room = sequelize.define('Room', {
    name: { type: DataTypes.TEXT, allowNull: false, unique: true },
    is_active: { type: DataTypes.BOOLEAN, defaultValue: true },
    company_id: { type: DataTypes.INTEGER, allowNull: false }
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
    Room.belongsTo(models.Company, { foreignKey: 'company_id', as: 'company' });
  };

  return Room;
};
