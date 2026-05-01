import { create } from 'zustand';
import type { Message, UserSummary } from '../types';

interface ChatState {
  users: UserSummary[];
  setUsers: (users: UserSummary[]) => void;
  
  activeUserId: string | null;
  setActiveUserId: (userId: string) => void;

  messagesByConversation: Record<string, Message[]>;
  addMessage: (message: Message) => void;
  markMessageRead: (conversationId: string, messageId: string, userId: string) => void;

  isConnected: boolean;
  setIsConnected: (connected: boolean) => void;

  typingUsers: Record<string, boolean>;
  setTyping: (userId: string, isTyping: boolean) => void;

  pageByConversation: Record<string, number>;
  hasMoreByConversation: Record<string, boolean>;
  setMessages: (conversationId: string, messages: Message[], hasMore: boolean) => void;
  prependMessages: (conversationId: string, messages: Message[], page: number, hasMore: boolean) => void;
}

export const useChatStore = create<ChatState>((set) => ({
  users: [],
  setUsers: (users) => set({ users }),

  activeUserId: null,
  setActiveUserId: (activeUserId) => set({ activeUserId }),

  messagesByConversation: {},
  pageByConversation: {},
  hasMoreByConversation: {},
  
  setMessages: (conversationId, messages, hasMore) =>
    set((state) => ({
      messagesByConversation: {
        ...state.messagesByConversation,
        [conversationId]: messages,
      },
      pageByConversation: {
        ...state.pageByConversation,
        [conversationId]: 1,
      },
      hasMoreByConversation: {
        ...state.hasMoreByConversation,
        [conversationId]: hasMore,
      },
    })),

  prependMessages: (conversationId, messages, page, hasMore) =>
    set((state) => {
      const existing = state.messagesByConversation[conversationId] || [];
      // Combine avoiding duplicates (just in case)
      const existingIds = new Set(existing.map(m => m.messageId));
      const newMessages = messages.filter(m => !existingIds.has(m.messageId));
      
      return {
        messagesByConversation: {
          ...state.messagesByConversation,
          [conversationId]: [...newMessages, ...existing],
        },
        pageByConversation: {
          ...state.pageByConversation,
          [conversationId]: page,
        },
        hasMoreByConversation: {
          ...state.hasMoreByConversation,
          [conversationId]: hasMore,
        },
      };
    }),
  
  addMessage: (message) =>
    set((state) => {
      const convMessages = state.messagesByConversation[message.conversationId] || [];
      // Prevent duplicates
      if (convMessages.some((m) => m.messageId === message.messageId)) {
        return state;
      }
      return {
        messagesByConversation: {
          ...state.messagesByConversation,
          [message.conversationId]: [...convMessages, message],
        },
      };
    }),

  markMessageRead: (conversationId, messageId, userId) =>
    set((state) => {
      const convMessages = state.messagesByConversation[conversationId] || [];
      const updatedMessages = convMessages.map((m) => {
        if (m.messageId === messageId && !m.readBy.includes(userId)) {
          return { ...m, readBy: [...m.readBy, userId] };
        }
        return m;
      });
      return {
        messagesByConversation: {
          ...state.messagesByConversation,
          [conversationId]: updatedMessages,
        },
      };
    }),

  isConnected: false,
  setIsConnected: (isConnected) => set({ isConnected }),

  typingUsers: {},
  setTyping: (userId, isTyping) =>
    set((state) => {
      const next = { ...state.typingUsers };
      if (isTyping) {
        next[userId] = true;
      } else {
        delete next[userId];
      }
      return { typingUsers: next };
    }),
}));
