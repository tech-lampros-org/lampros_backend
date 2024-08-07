import cors from 'cors';

const corsOptions = {
  origin: process.env.ALLOWED_ORIGINS || '*', // Allow all origins or specify allowed origins
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
  allowedHeaders: ['Content-Type', 'Authorization'],
};

const corsMiddleware = cors(corsOptions);

export default corsMiddleware;
