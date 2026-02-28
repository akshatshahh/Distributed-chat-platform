import knex, { type Knex } from 'knex';

export interface DatabaseConfig {
  host: string;
  port: number;
  user: string;
  password: string;
  database: string;
}

export function createDatabaseClient(config?: DatabaseConfig): Knex {
  return knex({
    client: 'pg',
    connection: {
      host: config?.host || process.env.DATABASE_HOST || 'localhost',
      port: config?.port || parseInt(process.env.DATABASE_PORT || '5432', 10),
      user: config?.user || process.env.DATABASE_USER || 'chatuser',
      password: config?.password || process.env.DATABASE_PASSWORD || 'chatpass',
      database: config?.database || process.env.DATABASE_NAME || 'chatplatform',
    },
    pool: {
      min: 2,
      max: 10,
      acquireTimeoutMillis: 10000,
    },
  });
}
