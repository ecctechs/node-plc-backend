const { DeviceAddress } = require('../models');

exports.findById = (id) => DeviceAddress.findByPk(id);
