import express from 'express';
import {logger} from './config/loggingConfig.js';
import connectDB from './config/dbConfig.js';
import corsMiddleware from './middlewares/corsMiddleware.js';
import requestLoggerMiddleware from './middlewares/requestLogger.js';
import config from './config/serverConfig.js';
import rateLimiter from './middlewares/rateLimiter.js';
import errorHandler from './middlewares/errorHandler.js';
import { protect } from './middlewares/protect.js'; 



import ro_user from './routes/user.js'
import ro_utils from './routes/utils.js'
import ro_posts from './routes/pro-post.js'
import ro_projects from './routes/pro-projects.js'
import ro_products from './routes/pro-products.js'
import category from './routes/catogory.js'
import ro_brands from './routes/brand.js'
import searchRoutes from './routes/serch.js'

const app = express();


connectDB();



app.use(rateLimiter);
// Body parser middleware
app.use(express.json()); // Parse JSON bodies
app.use(express.urlencoded({ extended: true }));
app.use(corsMiddleware);
app.use(requestLoggerMiddleware);


// Use OTP routes
app.use('/api/user', ro_user);
app.use('/api/utils', ro_utils);
app.use('/api/posts', ro_posts)
app.use('/api/projects', ro_projects);
app.use('/api/products', ro_products);
app.use('/api/category',protect, category);
app.use('/api/brand', ro_brands);
app.use('/api', protect, searchRoutes);


// Example route
app.get('/', (req, res) => {
  res.json({"status":"running in feature branch now testing..."})
});

app.use((req, res, next) => {
  res.status(404).json({
    status: 'error',
    message: 'Not Found',
    error: {
      code: 404,
      description: 'The requested resource could not be found'
    }
  });
});

// Use error handler middleware (after all routes and other middleware)
app.use(errorHandler);

const PORT = config.port;

app.listen(PORT, () => logger.info(`Server running in ${config.nodeEnv} mode on https://localhost:${PORT}`));

export default app;
