import { Sequelize } from 'sequelize';
import config from '../config/config.js';

let sequelize;

// Determine if we're in test mode or using SQLite
const isTestMode = process.env.NODE_ENV === 'test' || process.env.VITEST === 'true';
const dbUrl = config.database?.url || '';
const isExplicitSQLite = process.env.USE_SQLITE === 'true' || dbUrl.startsWith('sqlite') || !process.env.DATABASE_URL;
const useSQLite = isTestMode || isExplicitSQLite || (process.env.NODE_ENV === 'development' && !process.env.DATABASE_URL);

if (useSQLite) {
  // Use SQLite for testing, local development, or default zero-config deployment
  const storage = dbUrl.startsWith('sqlite://') ? dbUrl.replace('sqlite://', '') : './database.sqlite';
  sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: storage || './database.sqlite',
    logging: config.nodeEnv === 'development' ? console.log : false,
  });
} else {
  // Parse DATABASE_URL for MySQL connection
  // Format: mysql://user:password@host:port/database
  const parseDbUrl = (url) => {
    try {
      const parsed = new URL(url);
      return {
        username: decodeURIComponent(parsed.username),
        password: decodeURIComponent(parsed.password),
        host: parsed.hostname,
        port: parsed.port ? parseInt(parsed.port, 10) : 3306,
        database: parsed.pathname.replace(/^\//, '').split('?')[0],
      };
    } catch {
      const match = url.match(/mysql:\/\/([^:]+):([^@]+)@([^:]+):(\d+)\/([^?]+)/);
      if (!match) {
        throw new Error('Invalid DATABASE_URL format. Use mysql://user:password@host:port/database');
      }
      return {
        username: match[1],
        password: match[2],
        host: match[3],
        port: parseInt(match[4], 10),
        database: match[5],
      };
    }
  };

  const dbConfig = parseDbUrl(dbUrl);

  sequelize = new Sequelize(dbConfig.database, dbConfig.username, dbConfig.password, {
    host: dbConfig.host,
    port: dbConfig.port,
    dialect: 'mysql',
    logging: config.nodeEnv === 'development' ? console.log : false,
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: false,
      },
    },
  });
}

export default sequelize;
