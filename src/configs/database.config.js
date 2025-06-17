import mongoose from 'mongoose';
import logger from '../utils/logger.js';

const connectDb = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    logger.info('Connected to MongoDB');
  } catch (error) {
    logger.error('Error connecting to MongoDB');
    process.exit(1);
  }
};

export default connectDb;
