import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import {logger} from './loggingConfig.js';

dotenv.config();

const generateToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: '30d', // Token expiration time
  });
};

const verifyToken = (token) => {
  try {
    return jwt.verify(token, process.env.JWT_SECRET);
  } catch (error) {
    logger.error('JWT verification failed:', error);
    return null;
  }
};

export { generateToken, verifyToken };
