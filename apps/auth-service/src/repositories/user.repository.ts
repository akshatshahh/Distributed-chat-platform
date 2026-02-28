import type { Knex } from 'knex';

export interface UserRow {
  id: string;
  username: string;
  email: string;
  display_name: string;
  password_hash: string;
  avatar_url: string | null;
  status_message: string | null;
  is_active: boolean;
  last_seen_at: Date | null;
  created_at: Date;
  updated_at: Date;
}

export class UserRepository {
  constructor(private db: Knex) {}

  async findById(id: string): Promise<UserRow | undefined> {
    return this.db('users').where({ id }).first();
  }

  async findByEmail(email: string): Promise<UserRow | undefined> {
    return this.db('users').where({ email }).first();
  }

  async findByUsername(username: string): Promise<UserRow | undefined> {
    return this.db('users').where({ username }).first();
  }

  async create(data: {
    username: string;
    email: string;
    display_name: string;
    password_hash: string;
  }): Promise<UserRow> {
    const [user] = await this.db('users').insert(data).returning('*');
    return user;
  }

  async updateLastSeen(id: string): Promise<void> {
    await this.db('users').where({ id }).update({ last_seen_at: new Date() });
  }

  async storeRefreshToken(data: {
    user_id: string;
    token_hash: string;
    user_agent?: string;
    ip_address?: string;
    expires_at: Date;
  }): Promise<void> {
    await this.db('refresh_tokens').insert(data);
  }

  async findRefreshTokenByHash(tokenHash: string) {
    return this.db('refresh_tokens')
      .where({ token_hash: tokenHash })
      .whereNull('revoked_at')
      .where('expires_at', '>', new Date())
      .first();
  }

  async revokeRefreshToken(tokenHash: string): Promise<void> {
    await this.db('refresh_tokens')
      .where({ token_hash: tokenHash })
      .update({ revoked_at: new Date() });
  }

  async revokeAllUserRefreshTokens(userId: string): Promise<void> {
    await this.db('refresh_tokens')
      .where({ user_id: userId })
      .whereNull('revoked_at')
      .update({ revoked_at: new Date() });
  }
}
