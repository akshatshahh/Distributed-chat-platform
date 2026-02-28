import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable('channel_members', (table) => {
    table.uuid('channel_id').notNullable().references('id').inTable('channels').onDelete('CASCADE');
    table.uuid('user_id').notNullable().references('id').inTable('users').onDelete('CASCADE');
    table.string('role', 20).defaultTo('member');
    table.timestamp('joined_at', { useTz: true }).defaultTo(knex.fn.now());
    table.timestamp('last_read_at', { useTz: true }).defaultTo(knex.fn.now());
    table.string('notifications', 20).defaultTo('all');
    table.primary(['channel_id', 'user_id']);
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists('channel_members');
}
