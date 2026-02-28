export type MessageType = 'text' | 'image' | 'file' | 'system';

export interface Message {
  id: string;
  channelId: string;
  senderId: string;
  content: string;
  messageType: MessageType;
  replyToId: string | null;
  isEdited: boolean;
  isDeleted: boolean;
  metadata: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
}

export interface SendMessagePayload {
  channelId: string;
  content: string;
  type?: MessageType;
  replyToId?: string;
  metadata?: Record<string, unknown>;
}

export interface EditMessagePayload {
  channelId: string;
  messageId: string;
  content: string;
}

export interface MessageAck {
  success: boolean;
  messageId?: string;
  timestamp?: Date;
  error?: string;
}

export interface MessagePage {
  messages: Message[];
  cursor: string | null;
  hasMore: boolean;
}
