import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { createServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';
import passport from './config/passport.js';
import config from './config/config.js';
import sequelize from './database/sequelize.js';
import { runStartupMigrations } from './database/migrations.js';
import routes from './routes/index.js';
import { errorHandler, notFoundHandler } from './middleware/errorHandler.js';
import { setupSocketHandlers } from './sockets/index.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function resolveFrontendDist() {
  const candidates = [
    path.resolve(__dirname, '../../frontend/dist'),
    path.resolve(process.cwd(), '../frontend/dist'),
    path.resolve(process.cwd(), 'frontend/dist'),
  ];
  for (const dir of candidates) {
    if (fs.existsSync(path.join(dir, 'index.html'))) return dir;
  }
  return null;
}

const frontendDist = resolveFrontendDist();
const canServeFrontend = Boolean(frontendDist);
if (!canServeFrontend) {
  console.warn(
    '[SPA] frontend/dist/index.html not found. Deep links like /room/:id will 404 on this server. Build the frontend during deploy. Tried:',
    [
      path.resolve(__dirname, '../../frontend/dist'),
      path.resolve(process.cwd(), '../frontend/dist'),
      path.resolve(process.cwd(), 'frontend/dist'),
    ].join(', '),
  );
} else {
  console.log('[SPA] Serving React app from', frontendDist);
}

const app = express();
app.set('trust proxy', 1);
const httpServer = createServer(app);
const io = new SocketIOServer(httpServer, {
  cors: {
    origin: config.cors.origin,
    methods: ['GET', 'POST'],
    credentials: true,
  },
});

// Middleware
app.use(cors({
  origin: config.cors.origin,
  credentials: true,
}));
app.use(express.json());
app.use(cookieParser());
app.use(passport.initialize());
app.use(express.urlencoded({ extended: true }));

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ success: true, message: 'Server is running' });
});

// API routes
app.use('/api', routes);

// Socket.IO connection handling
setupSocketHandlers(io);

// Single-host deploy: SPA from frontend/dist (/room/:id shares one origin with API + WebSocket)
if (canServeFrontend) {
  app.use(
    express.static(frontendDist, {
      fallthrough: true,
    }),
  );
  app.use((req, res, next) => {
    if ((req.method !== 'GET' && req.method !== 'HEAD') || req.originalUrl.startsWith('/api')) {
      return next();
    }
    return res.sendFile(path.join(frontendDist, 'index.html'));
  });
}

// Error handling middleware
app.use(notFoundHandler);
app.use(errorHandler);

// Process event handlers
process.on('unhandledRejection', (reason) => {
  console.error('[Unhandled Rejection]', reason);
});

process.on('uncaughtException', (error) => {
  console.error('[Uncaught Exception]', error);
});

// Initialize database and start server
const startServer = async () => {
  try {
    // Test database connection
    await sequelize.authenticate();
    console.log('Database connection established successfully.');

    // Sync database models (disable alter for SQLite to avoid conflicts with custom migrations)
    const isSQLite = sequelize.options.dialect === 'sqlite';
    await sequelize.sync({ alter: config.nodeEnv === 'development' && !isSQLite });
    console.log('Database models synchronized.');

    // Ensure legacy production databases have the expected columns (additive only)
    try {
      await runStartupMigrations(sequelize);
    } catch (error) {
      console.warn('Database migration failed:', error?.message || error);
    }

    // Start HTTP server
    httpServer.listen(config.port, () => {
      console.log(`Server is running on port ${config.port}`);
      console.log(`Environment: ${config.nodeEnv}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

// Handle graceful shutdown
process.on('SIGTERM', async () => {
  console.log('SIGTERM received, shutting down gracefully...');
  await sequelize.close();
  httpServer.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});

startServer();

export { app, httpServer, io, sequelize };
