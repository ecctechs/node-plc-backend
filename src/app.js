const express = require('express');
const app = express();
const cors = require('cors');
const authMiddleware = require('../middleware/auth.middleware');
const tenantMiddleware = require('../middleware/tenant.middleware');
const perm = require('../middleware/permission.middleware');

app.use(express.json());
app.use(cors());

// Public routes — ไม่ต้อง token
app.use('/api/auth', require('../routes/auth.route'));

// ทุก route หลังจากนี้ต้อง login ก่อน
app.use(authMiddleware.authenticate);
app.use(tenantMiddleware.injectCompanyId);

app.use('/api/working-time', require('../routes/workingTime.route'));
app.use('/api/devices',      require('../routes/device.route'));
app.use('/api',              require('../routes/deviceAlarm.route'));
app.use('/api',              require('../routes/deviceNumberConfig.route'));
app.use('/api',              require('../routes/deviceLevelConfig.route'));
app.use('/api/device-types', require('../routes/deviceType.route'));
app.use('/api/rooms',        require('../routes/room.route'));
app.use('/api/products',     require('../routes/product.route'));
app.use('/api/downtime',     require('../routes/downtimeLog.route'));
app.use('/api/downtime-products', require('../routes/downtimeProduct.route'));
app.use('/api/users',        require('../routes/user.route'));
app.use('/api/employees',    require('../routes/employee.route'));
app.use('/api/data-retention', require('../routes/dataRetention.route'));

// 4a — Settings: checkTab('setting')
app.use('/api/settings', perm.checkTab('setting'), require('../routes/settings.route'));

// 4b — PLC / Demo tab
app.use('/api/plc', perm.checkTab('demo'), require('../routes/plc.route'));

// 4c — Interaction tab
app.use('/api/interaction', perm.checkTab('interaction'), require('../routes/interactionLayout.route'));

// 4d — Dashboard / OEE / Alarm History tabs
app.use('/api/dashboard', perm.checkTab('dashboard'), require('../routes/dashboard.routes'));
app.use('/api/oee',       perm.checkTab('oee'),       require('../routes/oee.route'));

module.exports = app;
