import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable('message_read_receipts', (table) => {
    table.uuid('channel_id').notNullable().references('id').inTable('channels').onDelete('CASCADE');
    table.uuid('user_id').notNullable().references('id').inTable('users').onDelete('CASCADE');
    table.uuid('last_read_msg').notNullable();
    table.timestamp('read_at', { useTz: true }).defaultTo(knex.fn.now());
    table.primary(['channel_id', 'user_id']);
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists('message_read_receipts');
}
