const { WorkingTime } = require('../models');

exports.findOne = async () => {
  return await WorkingTime.findOne();
};

exports.upsert = async (data) => {
  const existing = await WorkingTime.findOne();

  if (existing) {
    return await existing.update(data);
  }

  return await WorkingTime.create(data);
};
