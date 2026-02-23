'use strict';

// Backward-compatible entrypoint. Use `plcPoller.js` in new code.
module.exports = require('./plcPoller');

if (require.main === module) {
  module.exports.startPollWorker();
}
