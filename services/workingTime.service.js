const repo = require('../repositories/workingTime.repo');

const validDays = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];

function parseTimeToMinutes(timeStr) {
  const [hours, minutes] = timeStr.split(':').map(Number);
  return hours * 60 + minutes;
}

function calculateDailyPlannedTime(daySchedule) {
  let totalMinutes = 0;

  if (daySchedule.working_hours && Array.isArray(daySchedule.working_hours)) {
    for (const wh of daySchedule.working_hours) {
      if (wh.start && wh.end) {
        const startMin = parseTimeToMinutes(wh.start);
        const endMin = parseTimeToMinutes(wh.end);
        totalMinutes += (endMin - startMin);
      }
    }
  }

  if (daySchedule.break_times && Array.isArray(daySchedule.break_times)) {
    for (const bt of daySchedule.break_times) {
      if (bt.start && bt.end) {
        const startMin = parseTimeToMinutes(bt.start);
        const endMin = parseTimeToMinutes(bt.end);
        totalMinutes -= (endMin - startMin);
      }
    }
  }

  return Math.max(0, totalMinutes);
}

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

exports.getPlannedProductionTime = async (dateStr, currentTimeStr) => {
  const workingTime = await repo.findOne();
  
  if (!workingTime || !workingTime.schedule) {
    return {
      date: dateStr,
      day: null,
      planned_seconds: 0,
      planned_minutes: 0,
      planned_hours: 0,
      remaining_seconds: 0,
      remaining_minutes: 0,
      remaining_hours: 0,
      current_time: currentTimeStr,
      breakdown: {
        working_hours: [],
        break_times: [],
        total_work_minutes: 0,
        total_break_minutes: 0,
        elapsed_minutes: 0
      }
    };
  }

  const date = dateStr ? new Date(dateStr) : new Date();
  const dayName = date.toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();
  const daySchedule = workingTime.schedule[dayName] || { working_hours: [], break_times: [] };

  const workMinutes = calculateDailyPlannedTime(daySchedule);
  const totalWorkMinutes = daySchedule.working_hours.reduce((sum, wh) => {
    return sum + (wh.start && wh.end ? parseTimeToMinutes(wh.end) - parseTimeToMinutes(wh.start) : 0);
  }, 0);
  const totalBreakMinutes = daySchedule.break_times.reduce((sum, bt) => {
    return sum + (bt.start && bt.end ? parseTimeToMinutes(bt.end) - parseTimeToMinutes(bt.start) : 0);
  }, 0);

  let remainingMinutes = workMinutes;
  let elapsedMinutes = 0;

  if (currentTimeStr) {
    const nowMinutes = parseTimeToMinutes(currentTimeStr);
    let shiftStartMin = 0;
    let shiftEndMin = 0;

    for (const wh of daySchedule.working_hours) {
      if (wh.start && wh.end) {
        shiftStartMin = Math.min(shiftStartMin === 0 ? nowMinutes : shiftStartMin, parseTimeToMinutes(wh.start));
        shiftEndMin = Math.max(shiftEndMin, parseTimeToMinutes(wh.end));
      }
    }

    if (nowMinutes >= shiftStartMin && nowMinutes <= shiftEndMin) {
      elapsedMinutes = nowMinutes - shiftStartMin;

      for (const bt of daySchedule.break_times) {
        if (bt.start && bt.end) {
          const breakStart = parseTimeToMinutes(bt.start);
          const breakEnd = parseTimeToMinutes(bt.end);
          
          if (nowMinutes >= breakEnd) {
            elapsedMinutes -= (breakEnd - breakStart);
          } else if (nowMinutes >= breakStart && nowMinutes < breakEnd) {
            elapsedMinutes = elapsedMinutes - (nowMinutes - breakStart);
            break;
          }
        }
      }

      elapsedMinutes = Math.max(0, elapsedMinutes);
      remainingMinutes = workMinutes - elapsedMinutes;
    } else if (nowMinutes < shiftStartMin) {
      remainingMinutes = workMinutes;
      elapsedMinutes = 0;
    } else {
      remainingMinutes = 0;
      elapsedMinutes = workMinutes;
    }
  }

  return {
    date: date.toISOString().split('T')[0],
    day: dayName,
    planned_seconds: workMinutes * 60,
    planned_minutes: workMinutes,
    planned_hours: Math.round(workMinutes / 60 * 100) / 100,
    remaining_seconds: Math.max(0, remainingMinutes * 60),
    remaining_minutes: Math.max(0, remainingMinutes),
    remaining_hours: Math.round(Math.max(0, remainingMinutes) / 60 * 100) / 100,
    current_time: currentTimeStr,
    breakdown: {
      working_hours: daySchedule.working_hours,
      break_times: daySchedule.break_times,
      total_work_minutes: totalWorkMinutes,
      total_break_minutes: totalBreakMinutes,
      elapsed_minutes: elapsedMinutes
    }
  };
};

exports.getPlannedProductionTimeRange = async (startDateStr, endDateStr) => {
  const startDate = new Date(startDateStr);
  const endDate = new Date(endDateStr);
  const results = [];
  let totalPlannedMinutes = 0;

  for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
    const dateStr = d.toISOString().split('T')[0];
    const daily = await this.getPlannedProductionTime(dateStr);
    results.push(daily);
    totalPlannedMinutes += daily.planned_minutes;
  }

  return {
    start_date: startDateStr,
    end_date: endDateStr,
    total_planned_seconds: totalPlannedMinutes * 60,
    total_planned_minutes: totalPlannedMinutes,
    total_planned_hours: Math.round(totalPlannedMinutes / 60 * 100) / 100,
    days: results
  };
};
