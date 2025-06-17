import dotenv from 'dotenv';
dotenv.config();
import app from './app.js';

import connectDb from './configs/database.config.js';
import { config } from './configs/app.config.js';
import logger from './utils/logger.js';

const PORT = config.PORT;
// Database connection
connectDb();

// server
app.listen(PORT, () => {
  logger.info(`Server is listening on ${PORT} in ${config.NODE_ENV}`);
});

process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled Rejection at', promise, 'reason:', reason);
});
