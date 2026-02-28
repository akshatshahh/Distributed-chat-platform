import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable('channels', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.string('name', 100).notNullable();
    table.string('description', 500).nullable();
    table.string('type', 20).notNullable().defaultTo('group');
    table.uuid('created_by').notNullable().references('id').inTable('users');
    table.integer('max_members').defaultTo(500);
    table.boolean('is_archived').defaultTo(false);
    table.timestamps(true, true);
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists('channels');
}
