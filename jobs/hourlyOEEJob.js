const cron = require('node-cron');
const oeeService = require('../services/oee.service');

function startHourlyOEEJob() {
  cron.schedule('0 * * * *', async () => {
    console.log('[Cron] บันทึก OEE Hourly Snapshot...');
    try {
      const localNow = new Date();
      const dateStr = [
        localNow.getFullYear(),
        String(localNow.getMonth() + 1).padStart(2, '0'),
        String(localNow.getDate()).padStart(2, '0')
      ].join('-');
      const hourStr = `${String(localNow.getHours()).padStart(2, '0')}:00`;

      const results = await oeeService.generateHourlyOEE(dateStr, hourStr);
      console.log(`[Cron] OEE Hourly Snapshot บันทึกสำเร็จ (${results.length} products) @ ${hourStr}`);
    } catch (err) {
      console.error('[Cron] OEE Hourly Snapshot ล้มเหลว:', err.message);
    }
  });

  console.log('[Cron] Hourly OEE Job registered (runs at :00 every hour)');
}

module.exports = { startHourlyOEEJob };
