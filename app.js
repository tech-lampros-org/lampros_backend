import express from 'express';
import logger from './config/loggingConfig.js';

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware for logging requests
app.use((req, res, next) => {
  logger.info(`Incoming request: ${req.method} ${req.url}`);
  next();
});

// Example route
app.get('/', (req, res) => {
  logger.debug('Debugging the root route');
  logger.info('Serving the root route');
  res.send('Hello World!');
});

app.listen(PORT, () => {
  logger.info(`Server is running on port ${PORT}`);
});

export default app;
