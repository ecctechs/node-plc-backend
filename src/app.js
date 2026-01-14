const express = require('express');
const app = express();
const cors = require("cors");
const plcRoute = require('../routes/plc.route');

app.use(express.json());
app.use(cors());

app.use('/api/working-time', require('../routes/workingTime.route'));
app.use('/api/device-logs', require('../routes/deviceLog.route'));
app.use('/api/devices', require('../routes/device.route'));
app.use('/api/plc', plcRoute);

    

module.exports = app;
