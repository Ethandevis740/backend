const fs = require('fs');
const path = require('path');

// Create logs directory if it doesn't exist
const logsDir = path.join(__dirname, '../logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir);
}

const logFile = path.join(logsDir, 'access.log');

const logger = (req, res, next) => {
  const timestamp = new Date().toISOString();
  const method = req.method;
  const url = req.url;
  const userAgent = req.get('User-Agent') || 'Unknown';
  const ip = req.ip || req.connection.remoteAddress;

  // Console log
  console.log(`[${timestamp}] ${method} ${url} - ${ip}`);

  // File log
  const logEntry = `[${timestamp}] ${method} ${url} - ${ip} - ${userAgent}\n`;
  
  fs.appendFile(logFile, logEntry, (err) => {
    if (err) {
      console.error('Error writing to log file:', err);
    }
  });

  // Continue to next middleware
  next();
};

module.exports = logger;