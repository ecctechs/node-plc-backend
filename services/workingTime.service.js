const repo = require('../repositories/workingTime.repo');

exports.get = async () => {
  return await repo.findOne();
};

exports.update = async (payload) => {
  // ตัวอย่าง validation ง่าย ๆ
  if (payload.end_time <= payload.start_time) {
    throw new Error('end_time must be greater than start_time');
  }

  if (payload.break_end <= payload.break_start) {
    throw new Error('break_end must be greater than break_start');
  }

  return await repo.upsert(payload);
};
