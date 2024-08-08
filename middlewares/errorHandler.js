import {logger} from '../config/loggingConfig.js'; // Import your custom logger

// Error handler middleware
const errorHandler = (err, req, res, next) => {
  // Set the status code based on the error
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  
  // Log the error stack
  logger.error(err.stack);
  
  // Set the response status code
  res.status(statusCode);

  // Send the response
  res.json({
    message: err.message,
    // Send stack trace only in development
    stack: process.env.NODE_ENV === 'production' ? '🥞' : err.stack,
  });
};

export default errorHandler;
