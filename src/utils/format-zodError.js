import { HTTPSTATUS } from '../configs/http.config.js';
import { ErrorCodeEnum } from '../enums/error-code.enum.js';

const formatZodError = (res, error) => {
  const errors = error?.issues?.map((err) => ({
    field: err.path.join('.'),
    message: err.message,
  }));
  return res.status(HTTPSTATUS.BAD_REQUEST).json({
    message: 'Validation failed',
    errors: errors,
    errorCode: ErrorCodeEnum.VALIDATION_ERROR,
  });
};

export default formatZodError;
