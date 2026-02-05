const fs = require('fs');
const path = require('path');
const morgan = require('morgan');
const rfs = require('rotating-file-stream');

const logsFolder = path.join(__dirname, '..', '..', 'logs');

if (!fs.existsSync(logsFolder)) {
  fs.mkdirSync(logsFolder, { recursive: true });
}

// Create a rotating write stream for access logs
const accessLogStream = rfs.createStream('request.txt', {
  interval: '1d', // Rotate daily
  maxFiles: 30, // Keep logs for up to 30 days
  path: logsFolder
});

// Create a rotating write stream for error logs
const errorLogStream = rfs.createStream('error.txt', {
  interval: '1d', // Rotate daily
  maxFiles: 30, 
  path: logsFolder
});

// Morgan middleware for HTTP request logging
const requestLogger = morgan('combined', { stream: accessLogStream });

const errorLogger = (err, req = null) => {
  const timestamp = new Date().toISOString();
  const method = req ? req.method : 'UNKNOWN';
  const url = req ? req.originalUrl || req.url : 'N/A';
  const errorMessage = err.message || 'Unknown Error';

  const logMessage = `[${timestamp}] ERROR ${method} ${url} - ${errorMessage}\n`;

  errorLogStream.write(logMessage);
};

module.exports = {
  requestLogger,
  errorLogger
};
