const cron = require('node-cron');
const oeeService = require('../services/oee.service');
const { Company } = require('../models');

function startDailyOEEJob() {
  cron.schedule('55 23 * * *', async () => {
    console.log('[Cron] บันทึก OEE Snapshot...');
    try {
      const companies = await Company.findAll({ where: { is_active: true } });
      let total = 0;
      for (const company of companies) {
        const results = await oeeService.generateDailyOEE(undefined, undefined, company.id);
        total += results.length;
      }
      console.log(`[Cron] OEE Snapshot บันทึกสำเร็จ (${total} products)`);
    } catch (err) {
      console.error('[Cron] OEE Snapshot ล้มเหลว:', err.message);
    }
  });

  console.log('[Cron] Daily OEE Job registered (runs at 23:55 every day)');
}

module.exports = { startDailyOEEJob };
