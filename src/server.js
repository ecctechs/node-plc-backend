process.env.NODE_ENV = process.env.NODE_ENV || 'development';

const app = require('./app');
const { startPolling } = require('./jobs/plcPolling.job');

const PORT = process.env.PORT || 3001;

app.listen(PORT, async () => {
  console.log(`Server running on port ${PORT}`);
  
  // await startPolling();
});