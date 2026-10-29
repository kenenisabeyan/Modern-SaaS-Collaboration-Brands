import dotenv from 'dotenv';

dotenv.config();

// Parse CORS origins from comma-separated string, with automatic localhost support in development
function parseCorsOrigins() {
  const corsOrigin = process.env.CORS_ORIGIN;
  const isDev = (process.env.NODE_ENV || 'development') === 'development';
  
  if (corsOrigin && corsOrigin.trim() === '*') return true;
  
  const origins = corsOrigin
    ? corsOrigin.split(',').map(origin => origin.trim()).filter(Boolean)
    : [];

  return (origin, callback) => {
    // Allow non-browser requests (e.g. mobile apps, curl, server-to-server)
    if (!origin) return callback(null, true);

    // Allow explicitly configured origins
    if (origins.includes(origin)) {
      return callback(null, true);
    }

    // In development mode, automatically allow any localhost or 127.0.0.1 port (e.g. 5173, 5174, 5175, etc.)
    if (isDev && /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin)) {
      return callback(null, true);
    }

    // Fallback if no specific origins are defined: allow request origin
    if (origins.length === 0) {
      return callback(null, true);
    }

    return callback(null, false);
  };
}

const config = {
  nodeEnv: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT || '5000', 10),
  database: {
    url: process.env.DATABASE_URL || 'sqlite://./database.sqlite',
  },
  jwt: {
    secret: process.env.JWT_SECRET || 'your-secret-key',
    expiry: process.env.JWT_EXPIRY || '24h',
  },
  google: {
    clientId: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackUrl: '/api/auth/google/callback',
  },
  cors: {
    origin: parseCorsOrigins(),
  },
};

console.log('[Config] CORS Origin:', config.cors.origin);
console.log('[Config] Port:', config.port);
console.log('[Config] Environment:', config.nodeEnv);

export default config;
