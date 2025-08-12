const { logErrorToFile } = require('../utils/logs/logger')

const errorHandler = (err, req, res, next) => {
  
    logErrorToFile(err)

  if (err.code === "ER_DUP_ENTRY") {
    if(err.code)
    return res.status(400).json({ message: "Duplicate entry error: resource already exists." });
  }

  if (err.name === "ValidationError") {
    // example for validation libs like Joi, Mongoose
    return res.status(400).json({ message: err.message });
  }

  if (err.code === "ER_ACCESS_DENIED_ERROR") {
    return res.status(500).json({ message: "Database access denied." });
  }

  // Fallback for all other unexpected errors:
  return res.status(500).json({ message: "Internal Server Error" });
};

module.exports = errorHandler;
