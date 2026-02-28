import type { Knex } from 'knex';
import crypto from 'crypto';

export async function seed(knex: Knex): Promise<void> {
  await knex('channel_members').del();
  await knex('messages').del();
  await knex('channels').del();
  await knex('refresh_tokens').del();
  await knex('notifications').del();
  await knex('message_read_receipts').del();
  await knex('users').del();

  const users = await knex('users')
    .insert([
      {
        username: 'alice',
        email: 'alice@example.com',
        display_name: 'Alice Johnson',
        password_hash: '$2b$12$placeholder_hash_for_seeding_only',
      },
      {
        username: 'bob',
        email: 'bob@example.com',
        display_name: 'Bob Smith',
        password_hash: '$2b$12$placeholder_hash_for_seeding_only',
      },
      {
        username: 'charlie',
        email: 'charlie@example.com',
        display_name: 'Charlie Brown',
        password_hash: '$2b$12$placeholder_hash_for_seeding_only',
      },
    ])
    .returning('id');

  const channels = await knex('channels')
    .insert([
      {
        name: 'general',
        description: 'General discussion',
        type: 'public',
        created_by: users[0].id,
      },
      {
        name: 'random',
        description: 'Random chatter',
        type: 'public',
        created_by: users[0].id,
      },
    ])
    .returning('id');

  await knex('channel_members').insert([
    { channel_id: channels[0].id, user_id: users[0].id, role: 'owner' },
    { channel_id: channels[0].id, user_id: users[1].id, role: 'member' },
    { channel_id: channels[0].id, user_id: users[2].id, role: 'member' },
    { channel_id: channels[1].id, user_id: users[0].id, role: 'owner' },
    { channel_id: channels[1].id, user_id: users[1].id, role: 'member' },
  ]);

  await knex('messages').insert([
    {
      channel_id: channels[0].id,
      sender_id: users[0].id,
      content: 'Welcome to the general channel!',
      message_type: 'system',
    },
    {
      channel_id: channels[0].id,
      sender_id: users[1].id,
      content: 'Hey everyone!',
    },
    {
      channel_id: channels[1].id,
      sender_id: users[0].id,
      content: 'Welcome to random!',
      message_type: 'system',
    },
  ]);
}
