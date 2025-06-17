import { ZodError } from 'zod';
import formatZodError from '../utils/format-zodError.js';
import { HTTPSTATUS } from '../configs/http.config.js';
import logger from '../utils/logger.js';
import { AppError } from '../utils/appError.js';

const errorHandler = (error, req, res, next) => {
  logger.error(`Error occurred on PATH: ${req.path} `, error);

  if (error instanceof SyntaxError) {
    return res.status(HTTPSTATUS.BAD_REQUEST).json({
      message: 'Invalid JSON format. Please check your request body.',
    });
  }

  if (error instanceof ZodError) {
    return formatZodError(res, error);
  }

  if (error instanceof AppError) {
    return res.status(error.statusCode).json({
      message: error.message,
      errorCode: error.errorCode,
    });
  }

  return res.status(HTTPSTATUS.INTERNAL_SERVER_ERROR).json({
    message: 'Internal Server Error',
    error: error?.message || 'Unknown error occurred',
  });
};

export default errorHandler;
