import getEnv from '../utils/get-env.js';

const appConfig = () => ({
  NODE_ENV: getEnv('NODE_ENV', 'development'),
  PORT: getEnv('PORT', '6000'),
  BASE_PATH: getEnv('BASE_PATH', '/api'),
  FRONTEND_ORIGIN: getEnv('FRONTEND_ORIGIN', ''),
  ACCESS_TOKEN: getEnv('ACCESS_TOKEN', ''),
  MONGO_URI: getEnv('MONGO_URI', ''),
  REDIS_URI: getEnv('REDIS_URI', ''),
  SMTP_HOST: getEnv('SMTP_HOST', ''),
  SMTP_PORT: getEnv('SMTP_PORT', ''),
  SMTP_SERVICE: getEnv('SMTP_SERVICE', ''),
  SMTP_USER: getEnv('SMTP_USER', ''),
  SMTP_PASSWORD: getEnv('SMTP_PASSWORD', ''),
  GOOGLE_CALLBACK_URL: getEnv('GOOGLE_CALLBACK_URL', ''),
  GOOGLE_CLIENT_ID: getEnv('GOOGLE_CLIENT_ID', ''),
  GOOGLE_CLIENT_SECRET: getEnv('GOOGLE_CLIENT_SECRET', ''),

  //AWS configs
  AWS_ACCESS_KEY_ID: getEnv('AWS_ACCESS_KEY_ID', ''),
  AWS_SECRET_ACCESS_KEY: getEnv('AWS_SECRET_ACCESS_KEY', ''),
  AWS_REGION: getEnv('AWS_REGION', ''),
  S3_BUCKET_NAME: getEnv('S3_BUCKET_NAME', ''),
  CLOUDFRONT_DOMAIN: getEnv('CLOUDFRONT_DOMAIN', ''),
});

export const config = appConfig();
