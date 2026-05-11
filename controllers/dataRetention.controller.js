'use strict';

const dataRetentionService = require('../services/dataRetention.service');

exports.cleanOldLogs = async (req, res) => {
  try {
    const result = await dataRetentionService.cleanOldLogs();
    res.json({
      success: true,
      message: `ลบข้อมูลก่อน ${result.cutoff.toISOString()} เรียบร้อยแล้ว`,
      deleted: result.deleted
    });
  } catch (err) {
    console.error('[DataRetention]', err);
    res.status(500).json({ success: false, message: err.message });
  }
};
