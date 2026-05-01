// Message DTOs

export interface MessageResponse {
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

export interface SendMessagePayload {
  receiverId: string;
  content: string;
  correlationId?: string;
}

export interface MarkReadPayload {
  messageId: string;
  receiverId: string;
  correlationId?: string;
}

export interface MessagesQueryParams {
  page?: number;
  limit?: number;
}
