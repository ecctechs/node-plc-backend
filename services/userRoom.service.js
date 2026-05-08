'use strict';

const userRoomRepo = require('../repositories/userRoom.repo');

exports.create = (data) => {
  return userRoomRepo.create(data);
};

exports.bulkCreate = (data) => {
  return userRoomRepo.bulkCreate(data);
};

exports.findByUserAndRoom = (user_id, room_id) => {
  return userRoomRepo.findByUserAndRoom(user_id, room_id);
};

exports.findByUserId = (user_id) => {
  return userRoomRepo.findByUserId(user_id);
};

exports.update = (user_id, room_id, data) => {
  return userRoomRepo.update(user_id, room_id, data);
};

exports.delete = (user_id, room_id) => {
  return userRoomRepo.delete(user_id, room_id);
};
