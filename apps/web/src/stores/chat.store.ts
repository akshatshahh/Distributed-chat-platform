import { create } from 'zustand';
import type { Message, Channel } from '@chat/shared-types';

interface ChatState {
  channels: Channel[];
  activeChannelId: string | null;
  messages: Record<string, Message[]>;
  typingUsers: Record<string, string[]>;
  setChannels: (channels: Channel[]) => void;
  setActiveChannel: (channelId: string) => void;
  addMessage: (channelId: string, message: Message) => void;
  setMessages: (channelId: string, messages: Message[]) => void;
  prependMessages: (channelId: string, messages: Message[]) => void;
  updateMessage: (channelId: string, message: Message) => void;
  removeMessage: (channelId: string, messageId: string) => void;
  setTyping: (channelId: string, usernames: string[]) => void;
}

export const useChatStore = create<ChatState>((set) => ({
  channels: [],
  activeChannelId: null,
  messages: {},
  typingUsers: {},
  setChannels: (channels) => set({ channels }),
  setActiveChannel: (channelId) => set({ activeChannelId: channelId }),
  addMessage: (channelId, message) =>
    set((state) => {
      const existing = state.messages[channelId] || [];
      if (existing.some((m) => m.id === message.id)) return state;
      return { messages: { ...state.messages, [channelId]: [...existing, message] } };
    }),
  setMessages: (channelId, messages) =>
    set((state) => ({ messages: { ...state.messages, [channelId]: messages } })),
  prependMessages: (channelId, messages) =>
    set((state) => ({
      messages: { ...state.messages, [channelId]: [...messages, ...(state.messages[channelId] || [])] },
    })),
  updateMessage: (channelId, message) =>
    set((state) => ({
      messages: {
        ...state.messages,
        [channelId]: (state.messages[channelId] || []).map((m) => (m.id === message.id ? message : m)),
      },
    })),
  removeMessage: (channelId, messageId) =>
    set((state) => ({
      messages: {
        ...state.messages,
        [channelId]: (state.messages[channelId] || []).filter((m) => m.id !== messageId),
      },
    })),
  setTyping: (channelId, usernames) =>
    set((state) => ({ typingUsers: { ...state.typingUsers, [channelId]: usernames } })),
}));
