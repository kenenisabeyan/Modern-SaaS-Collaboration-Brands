import dotenv from 'dotenv';

dotenv.config();

// Parse CORS origins from comma-separated string
function parseCorsOrigins() {
  const corsOrigin = process.env.CORS_ORIGIN;
  
  if (corsOrigin) {
    if (corsOrigin.trim() === '*') return true;
    // Split by comma and trim whitespace
    const origins = corsOrigin.split(',').map(origin => origin.trim()).filter(Boolean);
    return origins.length > 0 ? origins : true;
  }
  
  // Fallback: reflect request origin so credentials: true works without browser rejecting wildcard
  return true;
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
