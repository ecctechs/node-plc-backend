const cron = require('node-cron');
const oeeService = require('../services/oee.service');

function startDailyOEEJob() {
  cron.schedule('55 23 * * *', async () => {
    console.log('[Cron] บันทึก OEE Snapshot...');
    try {
      const results = await oeeService.generateDailyOEE();
      console.log(`[Cron] OEE Snapshot บันทึกสำเร็จ (${results.length} products)`);
    } catch (err) {
      console.error('[Cron] OEE Snapshot ล้มเหลว:', err.message);
    }
  });

  console.log('[Cron] Daily OEE Job registered (runs at 23:55 every day)');
}

module.exports = { startDailyOEEJob };
