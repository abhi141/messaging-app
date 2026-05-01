export interface UserSummary {
  userId: string;
  username: string;
  displayName: string;
  bio?: string;
  avatarBase64?: string;
  avatarMimeType?: string;
}

export interface AuthResponse {
  token: string;
  user: UserSummary;
}

export interface Profile {
  userId: string;
  username: string;
  displayName: string;
  bio: string;
  avatarBase64?: string;
  avatarMimeType?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Message {
  messageId: string;
  conversationId: string;
  senderId: string;
  receiverId: string;
  senderUsername: string;
  senderDisplayName: string;
  content: string;
  readBy: string[];
  sentAt: string;
}
