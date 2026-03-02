// Environment loading block: reads .env into process.env.
const dotenv = require('dotenv');

dotenv.config();

const nodeEnv = process.env.NODE_ENV || 'development';

const requiredVars = ['DATABASE_URL', 'JWT_ACCESS_SECRET'];

// Startup validation block: fail fast if critical env vars are missing.
for (const envName of requiredVars) {
  if (!process.env[envName]) {
    throw new Error(`Missing required environment variable: ${envName}`);
  }
}

// Normalized config export block: keeps parsing/defaults in one place.
module.exports = {
  nodeEnv,
  port: Number(process.env.PORT || 4000),
  databaseUrl: process.env.DATABASE_URL,
  dbPoolMax: Number(process.env.DB_POOL_MAX || 10),
  dbIdleTimeoutMs: Number(process.env.DB_IDLE_TIMEOUT_MS || 10000),
  jwtAccessSecret: process.env.JWT_ACCESS_SECRET,
  jwtAccessTtl: process.env.JWT_ACCESS_TTL || '15m',
  bcryptRounds: Number(process.env.BCRYPT_ROUNDS || 12),
  corsAllowedOrigins: process.env.CORS_ALLOWED_ORIGINS || '*',
  rateLimitWindowMs: Number(process.env.RATE_LIMIT_WINDOW_MS || 15 * 60 * 1000),
  rateLimitMax: Number(process.env.RATE_LIMIT_MAX || 200),
  defaultPageSize: Number(process.env.DEFAULT_PAGE_SIZE || 20),
  maxPageSize: Number(process.env.MAX_PAGE_SIZE || 100),
  tenantCacheTtlMs: Number(process.env.TENANT_CACHE_TTL_MS || 60_000),
  platformProvisioningKey: process.env.PLATFORM_PROVISIONING_KEY || '',
  allowTenantHeader: process.env.ALLOW_TENANT_HEADER
    ? process.env.ALLOW_TENANT_HEADER === 'true'
    : nodeEnv !== 'production'
};
