import type { Knex } from 'knex';

const config: Knex.Config = {
  client: 'pg',
  connection: {
    host: process.env.DATABASE_HOST || 'localhost',
    port: parseInt(process.env.DATABASE_PORT || '5432', 10),
    user: process.env.DATABASE_USER || 'chatuser',
    password: process.env.DATABASE_PASSWORD || 'chatpass',
    database: process.env.DATABASE_NAME || 'chatplatform',
  },
  pool: {
    min: 2,
    max: 10,
    acquireTimeoutMillis: 10000,
  },
  migrations: {
    directory: './migrations',
    tableName: 'knex_migrations',
    extension: 'ts',
  },
  seeds: {
    directory: './seeds',
    extension: 'ts',
  },
};

export default config;
