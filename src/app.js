const express = require('express');
const app = express();

app.use(express.json());

app.use('/api/working-time', require('../routes/workingTime.route'));

module.exports = app;
