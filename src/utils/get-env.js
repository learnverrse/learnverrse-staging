import dotenv from 'dotenv';
dotenv.config();

import logger from './logger.js';

const getEnv = (key, defaultValue = '') => {
  const value = process.env[key];

  if (value === undefined) {
    if (defaultValue) {
      return defaultValue;
    }
    logger.error(`Environment variable ${key} is not set`);
    throw new Error(`Environment variable ${key} is not set`);
  }

  return value;
};
export default getEnv;
