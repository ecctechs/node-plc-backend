require('../config/config');
const oeeService = require('../services/oee.service');

const date = process.argv[2] || new Date().toISOString().split('T')[0];
const time = process.argv[3] || new Date().toTimeString().slice(0, 5);

console.log(`Running OEE snapshot for ${date} ${time} ...`);

oeeService.generateDailyOEE(date, time)
  .then(results => {
    console.log('Done:', JSON.stringify(results, null, 2));
    process.exit(0);
  })
  .catch(err => {
    console.error('Error:', err.message);
    process.exit(1);
  });