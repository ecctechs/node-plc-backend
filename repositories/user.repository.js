'use strict';

const { User } = require('../models');

exports.findByEmail = (email) => {
  return User.findOne({ where: { email } });
};

exports.findById = (id) => {
  return User.findByPk(id);
};

exports.create = (data) => {
  return User.create(data);
};

exports.update = (id, data) => {
  return User.update(data, { where: { id } });
};
