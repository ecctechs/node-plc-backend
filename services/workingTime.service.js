const repo = require('../repositories/workingTime.repo');

const validDays = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];

exports.get = async () => {
  return await repo.findOne();
};

exports.update = async (payload) => {
  // Validate schedule structure
  if (payload.schedule) {
    for (const [day, config] of Object.entries(payload.schedule)) {
      if (!validDays.includes(day.toLowerCase())) {
        throw new Error(`Invalid day: ${day}`);
      }

      // Validate working_hours
      if (config.working_hours && Array.isArray(config.working_hours)) {
        for (const wh of config.working_hours) {
          if (!wh.start || !wh.end) {
            throw new Error(`Working hours must have start and end for ${day}`);
          }
        }
      }

      // Validate break_times
      if (config.break_times && Array.isArray(config.break_times)) {
        for (const bt of config.break_times) {
          if (!bt.start || !bt.end) {
            throw new Error(`Break times must have start and end for ${day}`);
          }
        }
      }
    }
  }

  return await repo.upsert(payload);
};
