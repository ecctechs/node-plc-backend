const express = require('express');
const app = express();
const cors = require("cors");

app.use(express.json());
app.use(cors());

// Route: /api/working-time - Get/Update global working time (src/components/setting/WorkingTimeForm.vue)
app.use('/api/working-time', require('../routes/workingTime.route'));

// Route: /api/devices - Device & chart APIs (src/views/AddDashboardCardModal.vue, src/components/chart/*)
app.use('/api/devices', require('../routes/device.route'));

// Route: /api - Alarm APIs (src/components/setting/DeviceForm.vue, src/views/AlarmHistory.vue)
app.use('/api', require('../routes/deviceAlarm.route'));

// Route: /api/plc - PLC debug read (src/components/setting/PlcDebugForm.vue)
app.use('/api/plc', require('../routes/plc.route'));

// Route: /api - Number config (src/components/setting/DeviceForm.vue)
app.use('/api', require('../routes/deviceNumberConfig.route'));

// Route: /api - Level config (src/components/setting/DeviceForm.vue)
app.use('/api', require('../routes/deviceLevelConfig.route'));

// Route: /api/dashboard - Dashboard cards (src/App.vue, src/views/DashboardLayout.vue, src/views/AddDashboardCardModal.vue)
app.use('/api/dashboard', require('../routes/dashboard.routes'));

module.exports = app;
