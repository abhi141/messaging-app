"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerChatHandler = registerChatHandler;
const MessageService_1 = require("../../services/MessageService");
const SocketEvent_1 = require("../../enums/SocketEvent");
const canonicalLog_1 = require("../../utils/canonicalLog");
function registerChatHandler(io, socket) {
    const userId = socket.data.userId;
    const username = socket.data.username;
    const displayName = socket.data.displayName;
    const baseLog = socket.data.log;
    socket.on(SocketEvent_1.SocketEvent.SEND_MESSAGE, async (payload) => {
        const start = Date.now();
        const log = baseLog.child({
            module: 'chatHandler',
            correlationId: payload.correlationId ?? socket.data.correlationId,
            receiverId: payload.receiverId,
        });
        try {
            const message = await MessageService_1.messageService.sendMessage(payload.receiverId, payload.content, userId, log);
            const response = await MessageService_1.messageService.toResponse(message, log);
            // Emit to receiver's room and sender's own room
            io.to(payload.receiverId).to(userId).emit(SocketEvent_1.SocketEvent.NEW_MESSAGE, response);
            (0, canonicalLog_1.logCanonical)(log, { event: 'message.broadcast', status: 'success', durationMs: Date.now() - start, receiverId: payload.receiverId, messageId: response.messageId });
        }
        catch (err) {
            (0, canonicalLog_1.logCanonical)(log, { event: 'message.send', status: 'error', durationMs: Date.now() - start, errorMessage: err.message });
            socket.emit(SocketEvent_1.SocketEvent.ERROR, { code: 'SEND_FAILED', message: err.message });
        }
    });
    socket.on(SocketEvent_1.SocketEvent.TYPING, (payload) => {
        const log = baseLog.child({
            module: 'chatHandler',
            event: 'typing',
            correlationId: payload.correlationId ?? socket.data.correlationId,
            receiverId: payload.receiverId,
        });
        log.debug('User typing');
        socket.to(payload.receiverId).emit(SocketEvent_1.SocketEvent.USER_TYPING, { username, userId });
    });
    socket.on(SocketEvent_1.SocketEvent.MARK_READ, async (payload) => {
        const start = Date.now();
        const log = baseLog.child({
            module: 'chatHandler',
            correlationId: payload.correlationId ?? socket.data.correlationId,
            receiverId: payload.receiverId,
        });
        try {
            const message = await MessageService_1.messageService.markRead(payload.messageId, userId, log);
            // Let sender know it was read
            io.to(payload.receiverId).emit(SocketEvent_1.SocketEvent.MESSAGE_READ, {
                messageId: payload.messageId,
                conversationId: message.conversationId,
                userId,
                username,
                readBy: message.readBy,
            });
        }
        catch (err) {
            (0, canonicalLog_1.logCanonical)(log, { event: 'message.read', status: 'error', durationMs: Date.now() - start, errorMessage: err.message });
        }
    });
}
