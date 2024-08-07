import dotenv from 'dotenv';

// Load environment variables from .env file
dotenv.config();

const config = {
  nodeEnv: process.env.NODE_ENV || 'development',
  port: process.env.PORT || 3000,
  jwtSecret: process.env.JWT_SECRET || 'your_jwt_secret_key',
  allowedOrigins: process.env.ALLOWED_ORIGINS ? process.env.ALLOWED_ORIGINS.split(',') : '*',
  logLevel: process.env.LOG_LEVEL || 'debug',
};

export default config;
