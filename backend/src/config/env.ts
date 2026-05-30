import 'dotenv/config';

const required = (value: string | undefined, key: string) => {
  if (!value) throw new Error(`Missing env: ${key}`);
  return value;
};

const parseNumber = (value: string | undefined, fallback: number) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

export const env = {
  nodeEnv: process.env.NODE_ENV ?? 'development',
  port: parseNumber(process.env.PORT, 4000),
  mongoUri: required(process.env.MONGO_URI, 'MONGO_URI'),
  jwtAccessSecret: required(process.env.JWT_ACCESS_SECRET, 'JWT_ACCESS_SECRET'),
  jwtRefreshSecret: required(process.env.JWT_REFRESH_SECRET, 'JWT_REFRESH_SECRET'),
  accessTokenTtl: process.env.ACCESS_TOKEN_TTL ?? '15m',
  refreshTokenTtlDays: parseNumber(process.env.REFRESH_TOKEN_TTL_DAYS, 7),
  frontendOrigin: process.env.FRONTEND_ORIGIN ?? 'http://localhost:5173',
  executionServiceUrl: process.env.EXECUTION_SERVICE_URL ?? 'http://localhost:5001',
  disableExecution: process.env.DISABLE_EXECUTION === 'true',
  bcryptRounds: parseNumber(process.env.BCRYPT_ROUNDS, 12),
  cookieDomain: process.env.COOKIE_DOMAIN || undefined
} as const;

export const isProduction = env.nodeEnv === 'production';
