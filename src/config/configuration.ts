// config/configuration.ts
import { registerAs } from '@nestjs/config';
import Joi from 'joi';

export const configSchema = Joi.object({
  NODE_ENV: Joi.string()
    .valid('development', 'production', 'test')
    .default('development'),
  PORT: Joi.number().default(3000),
  DATABASE_URL: Joi.string().required(),
  REDIS_URL: Joi.string().required(),
  PAYU_MERCHANT_KEY: Joi.string().required(),
  PAYU_MERCHANT_SALT: Joi.string().required(),
  PAYU_MODE: Joi.string().valid('TEST', 'PRODUCTION').default('TEST'),
});

export default registerAs('config', () => ({
  env: process.env.NODE_ENV,
  port: parseInt(process.env.PORT, 10),
  database: {
    url: process.env.DATABASE_URL,
  },
  redis: {
    url: process.env.REDIS_URL,
    ttl: 3600,
  },
  payu: {
    merchantKey: process.env.PAYU_MERCHANT_KEY,
    merchantSalt: process.env.PAYU_MERCHANT_SALT,
    mode: process.env.PAYU_MODE,
    successUrl: process.env.PAYU_SUCCESS_URL,
    failureUrl: process.env.PAYU_FAILURE_URL,
  },
}));
