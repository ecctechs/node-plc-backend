'use strict';

const { UserRoom } = require('../models');

exports.create = (data) => {
  return UserRoom.create(data);
};

exports.bulkCreate = (data) => {
  return UserRoom.bulkCreate(data);
};

exports.findByUserAndRoom = (user_id, room_id) => {
  return UserRoom.findOne({ where: { user_id, room_id } });
};

exports.findByUserId = (user_id) => {
  return UserRoom.findAll({ where: { user_id } });
};

exports.update = (user_id, room_id, data) => {
  return UserRoom.update(data, { where: { user_id, room_id } });
};

exports.delete = (user_id, room_id) => {
  return UserRoom.destroy({ where: { user_id, room_id } });
};
