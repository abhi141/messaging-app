import { Server, Socket } from 'socket.io';
import { messageService } from '../../services/MessageService';
import { SocketEvent } from '../../enums/SocketEvent';
import { logCanonical } from '../../utils/canonicalLog';
import { Logger } from 'winston';

interface SendMessagePayload {
  receiverId: string;
  content: string;
  correlationId?: string;
}

interface TypingPayload {
  receiverId: string;
  correlationId?: string;
}

interface MarkReadPayload {
  messageId: string;
  receiverId: string;
  correlationId?: string;
}

export function registerChatHandler(io: Server, socket: Socket): void {
  const userId: string = socket.data.userId as string;
  const username: string = socket.data.username as string;
  const baseLog: Logger = socket.data.log as Logger;

  socket.on(SocketEvent.SEND_MESSAGE, async (payload: SendMessagePayload) => {
    const start = Date.now();
    const log = baseLog.child({
      module: 'chatHandler',
      correlationId: payload.correlationId ?? socket.data.correlationId,
      receiverId: payload.receiverId,
    });
    try {
      const message = await messageService.sendMessage(
        payload.receiverId,
        payload.content,
        userId,
        log,
      );
      const response = await messageService.toResponse(message, log);

      // Emit to receiver's room and sender's own room
      io.to(payload.receiverId).to(userId).emit(SocketEvent.NEW_MESSAGE, response);

      logCanonical(log, { event: 'message.broadcast', status: 'success', durationMs: Date.now() - start, receiverId: payload.receiverId, messageId: response.messageId });
    } catch (err) {
      logCanonical(log, { event: 'message.send', status: 'error', durationMs: Date.now() - start, errorMessage: (err as Error).message });
      socket.emit(SocketEvent.ERROR, { code: 'SEND_FAILED', message: (err as Error).message });
    }
  });

  socket.on(SocketEvent.TYPING, (payload: TypingPayload) => {
    const log = baseLog.child({
      module: 'chatHandler',
      event: 'typing',
      correlationId: payload.correlationId ?? socket.data.correlationId,
      receiverId: payload.receiverId,
    });
    log.debug('User typing');
    socket.to(payload.receiverId).emit(SocketEvent.USER_TYPING, { username, userId });
  });

  socket.on(SocketEvent.MARK_READ, async (payload: MarkReadPayload) => {
    const start = Date.now();
    const log = baseLog.child({
      module: 'chatHandler',
      correlationId: payload.correlationId ?? socket.data.correlationId,
      receiverId: payload.receiverId,
    });
    try {
      const message = await messageService.markRead(payload.messageId, userId, log);
      // Let sender know it was read
      io.to(payload.receiverId).emit(SocketEvent.MESSAGE_READ, {
        messageId: payload.messageId,
        conversationId: message.conversationId,
        userId,
        username,
        readBy: message.readBy,
      });
    } catch (err) {
      logCanonical(log, { event: 'message.read', status: 'error', durationMs: Date.now() - start, errorMessage: (err as Error).message });
    }
  });
}
