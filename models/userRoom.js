'use strict';

const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class UserRoom extends Model {
    static associate(models) {
      UserRoom.belongsTo(models.User, { foreignKey: 'user_id', as: 'user' });
      UserRoom.belongsTo(models.Room, { foreignKey: 'room_id', as: 'room' });
      UserRoom.belongsTo(models.User, { foreignKey: 'assigned_by', as: 'assignedBy' });
    }
  }

  UserRoom.init({
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
      allowNull: false
    },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    room_id: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    scope: {
      type: DataTypes.STRING(10),
      allowNull: false,
      defaultValue: 'view',
      validate: {
        isIn: [['view', 'control', 'manage']]
      }
    },
    assigned_by: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    assigned_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW
    }
  }, {
    sequelize,
    modelName: 'UserRoom',
    tableName: 'user_rooms',
    timestamps: false
  });

  return UserRoom;
};
