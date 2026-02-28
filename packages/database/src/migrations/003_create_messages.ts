import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable('messages', (table) => {
    table.uuid('id').notNullable().defaultTo(knex.raw('gen_random_uuid()'));
    table.uuid('channel_id').notNullable();
    table.uuid('sender_id').notNullable().references('id').inTable('users');
    table.text('content').notNullable();
    table.string('message_type', 20).defaultTo('text');
    table.uuid('reply_to_id').nullable();
    table.boolean('is_edited').defaultTo(false);
    table.boolean('is_deleted').defaultTo(false);
    table.jsonb('metadata').defaultTo('{}');
    table.timestamps(true, true);
    table.primary(['channel_id', 'id']);
    table.foreign('channel_id').references('id').inTable('channels').onDelete('CASCADE');
  });

  await knex.schema.raw(
    'CREATE INDEX idx_messages_channel_created ON messages(channel_id, created_at DESC)',
  );
  await knex.schema.raw('CREATE INDEX idx_messages_sender ON messages(sender_id)');
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists('messages');
}
