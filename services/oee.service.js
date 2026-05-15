const { Product, OeeDailySnapshot, OeeHourlySnapshot } = require('../models');
const { Op } = require('sequelize');
const workingTimeService = require('./workingTime.service');
const downtimeService = require('./downtimeProduct.service');

async function getTodayOutput(product, today) {
  // total_output บน products table เป็น cumulative counter ไม่ reset รายวัน
  // หาวันก่อนหน้า แล้วเอา total_output ณ วันนั้นมาลบ
  const d = new Date(today);
  d.setDate(d.getDate() - 1);
  const yesterday = d.toISOString().split('T')[0];

  const prevSnapshot = await OeeDailySnapshot.findOne({
    where: { product_id: product.id, snapshot_date: yesterday }
  });

  const baseOutput = prevSnapshot ? Number(prevSnapshot.total_output) : 0;
  const baseReject = prevSnapshot ? Number(prevSnapshot.total_reject) : 0;

  return {
    total_output: Math.max(0, product.total_output - baseOutput),
    reject_output: Math.max(0, product.reject_output - baseReject)
  };
}

exports.generateDailyOEE = async (dateStr, currentTime) => {
  // ใช้ local date ไม่ใช่ UTC เพื่อ timezone ถูกต้อง
  const localNow = new Date();
  const today = dateStr || [
    localNow.getFullYear(),
    String(localNow.getMonth() + 1).padStart(2, '0'),
    String(localNow.getDate()).padStart(2, '0')
  ].join('-');
  const now = currentTime || localNow.toTimeString().slice(0, 5);

  // downtime query ใช้ local time (ไม่มี Z suffix) เพื่อ timezone ตรงกับ dashboard
  const startOfDay = new Date(`${today}T00:00:00`);
  const endOfDay   = new Date(`${today}T23:59:59`);

  const products = await Product.findAll();
  const results = [];

  for (const product of products) {
    const wtData = await workingTimeService.getPlannedProductionTime(today, now);
    const planned_min = wtData.breakdown.elapsed_minutes || 0;

    const downtimeSeconds = await downtimeService.calculateDowntime(
      product.id,
      startOfDay,
      endOfDay
    );
    const downtime_min = downtimeSeconds / 60;

    // ยอดผลิตวันนี้ (ลบ cumulative ของเมื่อวาน)
    const { total_output, reject_output } = await getTodayOutput(product, today);

    const operating_min  = Math.max(0, planned_min - downtime_min);
    const availability   = planned_min > 0 ? (operating_min / planned_min * 100) : 0;
    // cycle_time หน่วย วินาที → แปลง operating_min เป็น วินาที ด้วย *60
    const performance    = (operating_min > 0 && product.cycle_time > 0)
      ? (product.cycle_time * total_output / (operating_min * 60) * 100) : 0;
    const good_count     = Math.max(0, total_output - reject_output);
    const quality        = total_output > 0 ? (good_count / total_output * 100) : 0;
    const oee            = (availability * performance * quality / 10000);

    await OeeDailySnapshot.upsert({
      product_id:    product.id,
      snapshot_date: today,
      oee,
      availability,
      performance,
      quality,
      total_output,
      total_reject:  reject_output,
      downtime_min,
      planned_min,
      updated_at:    new Date()
    });

    results.push({
      product_id:   product.id,
      product_name: product.name,
      oee:          Math.round(oee * 100) / 100,
      availability: Math.round(availability * 100) / 100,
      performance:  Math.round(performance * 100) / 100,
      quality:      Math.round(quality * 100) / 100,
      total_output,
      reject_output,
      planned_min,
      downtime_min: Math.round(downtime_min * 100) / 100
    });
  }

  return results;
};

exports.generateHourlyOEE = async (dateStr, hourStr) => {
  const localNow = new Date();
  const today = dateStr || [
    localNow.getFullYear(),
    String(localNow.getMonth() + 1).padStart(2, '0'),
    String(localNow.getDate()).padStart(2, '0')
  ].join('-');
  const now = hourStr || `${String(localNow.getHours()).padStart(2, '0')}:00`;

  const startOfDay       = new Date(`${today}T00:00:00`);
  const endOfCurrentHour = new Date(`${today}T${now}:00`);

  const products = await Product.findAll();
  const results  = [];

  for (const product of products) {
    const wtData      = await workingTimeService.getPlannedProductionTime(today, now);
    const planned_min = wtData.breakdown.elapsed_minutes || 0;

    const downtimeSeconds = await downtimeService.calculateDowntime(
      product.id,
      startOfDay,
      endOfCurrentHour
    );
    const downtime_min = downtimeSeconds / 60;

    const { total_output, reject_output } = await getTodayOutput(product, today);

    const operating_min = Math.max(0, planned_min - downtime_min);
    const availability  = planned_min > 0 ? (operating_min / planned_min * 100) : 0;
    const performance   = (operating_min > 0 && product.cycle_time > 0)
      ? (product.cycle_time * total_output / (operating_min * 60) * 100) : 0;
    const good_count    = Math.max(0, total_output - reject_output);
    const quality       = total_output > 0 ? (good_count / total_output * 100) : 0;
    const oee           = (availability * performance * quality / 10000);

    await OeeHourlySnapshot.upsert({
      product_id:    product.id,
      snapshot_hour: endOfCurrentHour,
      oee,
      availability,
      performance,
      quality,
      total_output,
      total_reject:  reject_output,
      downtime_min,
      planned_min,
      updated_at:    new Date()
    }, { conflictFields: ['product_id', 'snapshot_hour'] });

    results.push({
      product_id:    product.id,
      product_name:  product.name,
      snapshot_hour: endOfCurrentHour,
      oee:           Math.round(oee * 100) / 100,
      availability:  Math.round(availability * 100) / 100,
      performance:   Math.round(performance * 100) / 100,
      quality:       Math.round(quality * 100) / 100,
      total_output,
      reject_output,
      planned_min,
      downtime_min:  Math.round(downtime_min * 100) / 100
    });
  }

  return results;
};

exports.getIntradayHistory = async (productId, dateStr) => {
  const localNow = new Date();
  const date = dateStr || [
    localNow.getFullYear(),
    String(localNow.getMonth() + 1).padStart(2, '0'),
    String(localNow.getDate()).padStart(2, '0')
  ].join('-');

  const rows = await OeeHourlySnapshot.findAll({
    where: {
      product_id:    productId,
      snapshot_hour: { [Op.between]: [new Date(`${date}T00:00:00`), new Date(`${date}T23:59:59`)] }
    },
    attributes: ['snapshot_hour', 'oee', 'availability', 'performance', 'quality',
                 'total_output', 'total_reject', 'planned_min', 'downtime_min'],
    order: [['snapshot_hour', 'ASC']]
  });

  return rows.map(r => ({
    hour:         r.snapshot_hour,
    oee:          parseFloat(r.oee),
    availability: parseFloat(r.availability),
    performance:  parseFloat(r.performance),
    quality:      parseFloat(r.quality),
    total_output: r.total_output,
    total_reject: r.total_reject,
    planned_min:  parseFloat(r.planned_min),
    downtime_min: parseFloat(r.downtime_min)
  }));
};

exports.getSnapshotHistory = async (productId, days) => {
  const period = days === 30 ? 30 : 7;

  const localNow = new Date();
  const dates = [];
  for (let i = period - 1; i >= 0; i--) {
    const d = new Date(localNow);
    d.setDate(d.getDate() - i);
    dates.push([
      d.getFullYear(),
      String(d.getMonth() + 1).padStart(2, '0'),
      String(d.getDate()).padStart(2, '0')
    ].join('-'));
  }

  const startDate = dates[0];
  const endDate   = dates[dates.length - 1];

  const rows = await OeeDailySnapshot.findAll({
    where: {
      product_id:    productId,
      snapshot_date: { [Op.between]: [startDate, endDate] }
    },
    attributes: ['snapshot_date', 'oee', 'availability', 'performance', 'quality'],
    order: [['snapshot_date', 'ASC']]
  });

  const rowMap = {};
  rows.forEach(r => { rowMap[r.snapshot_date] = r; });

  return dates.map(date => {
    const row = rowMap[date];
    if (!row) return { date, oee: null, availability: null, performance: null, quality: null };
    return {
      date,
      oee:          parseFloat(row.oee),
      availability: parseFloat(row.availability),
      performance:  parseFloat(row.performance),
      quality:      parseFloat(row.quality)
    };
  });
};
