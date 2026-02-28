import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.raw('CREATE EXTENSION IF NOT EXISTS "pgcrypto"');

  await knex.schema.createTable('users', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.string('username', 50).unique().notNullable();
    table.string('email', 255).unique().notNullable();
    table.string('display_name', 100).notNullable();
    table.string('password_hash', 255).notNullable();
    table.string('avatar_url', 500).nullable();
    table.string('status_message', 200).nullable();
    table.boolean('is_active').defaultTo(true);
    table.timestamp('last_seen_at', { useTz: true }).nullable();
    table.timestamps(true, true);
  });

  await knex.schema.raw('CREATE INDEX idx_users_username ON users(username)');
  await knex.schema.raw('CREATE INDEX idx_users_email ON users(email)');
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists('users');
}
