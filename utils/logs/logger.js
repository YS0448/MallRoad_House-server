const fs = require('fs');
const path = require('path');

const logFilePath = path.join(__dirname, '..', 'logs', 'error.log');

function logErrorToFile(error) {
  const logMessage = `[${new Date().toISOString()}] ${error.stack || error}\n\n`;
  
  // Ensure logs folder exists
  fs.mkdir(path.dirname(logFilePath), { recursive: true }, (err) => {
    if (err) console.error('Error creating log directory:', err);
    
    // Append error to the file
    fs.appendFile(logFilePath, logMessage, (err) => {
      if (err) console.error('Failed to write error log:', err);
    });
  });
}

module.exports = { logErrorToFile };