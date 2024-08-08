import morgan from 'morgan';
import {logger} from '../config/loggingConfig.js'; // Adjusted import path for logger

// Create a stream object with a 'write' function that will be used by morgan
const stream = {
  write: (message) => logger.info(message.trim()),
};

// Skip logging in test environment
const skip = () => {
  const env = process.env.NODE_ENV || 'development';
  return env === 'test';
};

// Build the morgan middleware
const requestLoggerMiddleware = morgan('combined', { stream, skip });

export default requestLoggerMiddleware;
