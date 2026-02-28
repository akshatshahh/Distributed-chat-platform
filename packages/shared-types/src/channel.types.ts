export type ChannelType = 'group' | 'direct' | 'public';
export type MemberRole = 'owner' | 'admin' | 'member';
export type NotificationPreference = 'all' | 'mentions' | 'none';

export interface Channel {
  id: string;
  name: string;
  description: string | null;
  type: ChannelType;
  createdBy: string;
  maxMembers: number;
  isArchived: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface ChannelMember {
  channelId: string;
  userId: string;
  role: MemberRole;
  joinedAt: Date;
  lastReadAt: Date;
  notifications: NotificationPreference;
}

export interface CreateChannelPayload {
  name: string;
  description?: string;
  type: ChannelType;
}

export interface ChannelWithMembers extends Channel {
  members: ChannelMember[];
  memberCount: number;
}
