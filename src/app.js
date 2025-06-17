import express from 'express';
import passport from 'passport';
import './configs/passport.config.js';
import helmet from 'helmet';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import redis from './redis/index.js';
import { RateLimiterRedis } from 'rate-limiter-flexible';
import routes from './routes/index.js';
import errorHandler from './middlewares/errorHandler.middleware.js';
import logger from './utils/logger.js';

const app = express();

//USE PASSPORT
app.use(passport.initialize());

// MIDDLEWARES
app.use(helmet());
app.use(cors({ origin: true, credentials: true }));
app.use(express.json());
app.use(cookieParser());

app.use((req, res, next) => {
  logger.info(`Received ${req.method} request to ${req.url}`);
  next();
});

//DDOS PROTECTION RATE LIMITING
const rateLimiter = new RateLimiterRedis({
  storeClient: redis,
  keyPrefix: 'middleware',
  points: 10,
  duration: 1,
});

app.use((req, res, next) => {
  rateLimiter
    .consume(req.ip)
    .then(() => next())
    .catch(() => {
      logger.warn(`Rate limit exceeded for IP: ${req.ip}`);
      res.status(429).json({ success: false, message: 'Too many requests' });
    });
});

// API ROUTES
app.use('/api', routes);

// GLOBAL ERROR HANDLER
app.use(errorHandler);

export default app;
