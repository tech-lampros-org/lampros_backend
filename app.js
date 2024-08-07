import express from 'express';
import logger from './config/loggingConfig.js';
import connectDB from './config/dbConfig.js';
import corsMiddleware from './middlewares/corsMiddleware.js';
import requestLoggerMiddleware from './middlewares/requestLogger.js';
import config from './config/serverConfig.js';
import rateLimiter from './middlewares/rateLimiter.js';
import errorHandler from './middlewares/errorHandler.js';
import advancedUserRoutes from './routes/advancedUserRoutes.js';
import otpRoutes from './routes/otpRoutes.js'

const app = express();


connectDB();

// Use rate limiter middleware
app.use(rateLimiter);
// Body parser middleware
app.use(express.json()); // Parse JSON bodies
app.use(express.urlencoded({ extended: true }));

// Use CORS middleware
app.use(corsMiddleware);

// Use request logger middleware
app.use(requestLoggerMiddleware);

app.use('/api/advanced-users', advancedUserRoutes);

// Use OTP routes
app.use('/api/homeowners', otpRoutes);


// Example route
app.get('/', (req, res) => {
  res.json({"status":"running..."})
});

// Use error handler middleware (after all routes and other middleware)
app.use(errorHandler);

const PORT = config.port;

app.listen(PORT, () => logger.info(`Server running in ${config.nodeEnv} mode on port ${PORT}`));

export default app;
