const express = require('express');
const app = express();
const cors = require('cors');

app.use(express.json());
app.use(cors());

app.use('/api/working-time', require('../routes/workingTime.route'));
app.use('/api/devices', require('../routes/device.route'));
app.use('/api', require('../routes/deviceAlarm.route'));
app.use('/api/plc', require('../routes/plc.route'));
app.use('/api', require('../routes/deviceNumberConfig.route'));
app.use('/api', require('../routes/deviceLevelConfig.route'));
app.use('/api/dashboard', require('../routes/dashboard.routes'));

module.exports = app;
