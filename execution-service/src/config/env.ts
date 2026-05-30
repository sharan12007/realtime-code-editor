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
  port: parseNumber(process.env.PORT, 5001),
  allowedOrigin: process.env.ALLOWED_ORIGIN ?? 'http://localhost:4000',
  maxExecutionTimeMs: parseNumber(process.env.MAX_EXECUTION_TIME_MS, 5000),
  maxMemoryMb: parseNumber(process.env.MAX_MEMORY_MB, 256),
  maxOutputBytes: parseNumber(process.env.MAX_OUTPUT_BYTES, 65536),
  dockerBin: required(process.env.DOCKER_BIN, 'DOCKER_BIN')
} as const;
