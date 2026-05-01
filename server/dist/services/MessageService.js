"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.messageService = exports.MessageService = void 0;
const db_1 = require("../config/db");
const Message_1 = require("../entities/Message");
const AppError_1 = require("../errors/AppError");
const canonicalLog_1 = require("../utils/canonicalLog");
const mongodb_1 = require("mongodb");
const MAX_CONTENT_LENGTH = 2000;
const DEFAULT_PAGE_SIZE = 50;
const MAX_PAGE_SIZE = 100;
class MessageService {
    get repo() {
        return db_1.AppDataSource.getMongoRepository(Message_1.Message);
    }
    computeConversationId(user1Id, user2Id) {
        return [user1Id, user2Id].sort().join('_');
    }
    async sendMessage(receiverId, content, senderId, log) {
        const start = Date.now();
        const conversationId = this.computeConversationId(senderId, receiverId);
        const childLog = log.child({ module: 'MessageService', conversationId });
        if (!content || content.trim().length === 0) {
            throw new AppError_1.ValidationError('Message cannot be empty.', 'EMPTY_MESSAGE');
        }
        if (content.length > MAX_CONTENT_LENGTH) {
            throw new AppError_1.ValidationError(`Message too long (max ${MAX_CONTENT_LENGTH} characters).`, 'MESSAGE_TOO_LONG');
        }
        const message = this.repo.create({
            conversationId,
            content: content.trim(),
            senderId,
            receiverId,
            readBy: [senderId],
        });
        const saved = await this.repo.save(message);
        (0, canonicalLog_1.logCanonical)(childLog, {
            event: 'message.send',
            status: 'success',
            durationMs: Date.now() - start,
            messageId: String(saved._id),
        });
        return saved;
    }
    async getMessages(conversationId, page = 1, limit = DEFAULT_PAGE_SIZE, log) {
        const safeLimit = Math.min(limit, MAX_PAGE_SIZE);
        const skip = (page - 1) * safeLimit;
        const messages = await this.repo.find({
            where: { conversationId },
            order: { sentAt: 'ASC' },
            skip,
            take: safeLimit,
        });
        return this.populateMessages(messages, log);
    }
    async searchMessages(conversationId, query, log) {
        if (!query || query.trim().length === 0)
            return [];
        const messages = await this.repo.find({
            where: {
                conversationId,
                content: { $regex: query.trim(), $options: 'i' },
            },
            order: { sentAt: 'DESC' },
            take: 50,
        });
        return this.populateMessages(messages, log);
    }
    async populateMessages(messages, log) {
        if (messages.length === 0)
            return [];
        const childLog = log.child({ module: 'MessageService', action: 'populateMessages' });
        const senderIds = Array.from(new Set(messages.map((m) => m.senderId)));
        const userRepo = db_1.AppDataSource.getMongoRepository('User');
        const users = await userRepo.find({
            where: {
                _id: { $in: senderIds.map((id) => new mongodb_1.ObjectId(id)) },
            },
        });
        const userMap = new Map(users.map((u) => [String(u._id), u]));
        return messages.map((msg) => {
            const sender = userMap.get(msg.senderId);
            return {
                messageId: String(msg._id),
                conversationId: msg.conversationId,
                senderId: msg.senderId,
                receiverId: msg.receiverId,
                senderUsername: sender?.username || 'unknown',
                senderDisplayName: sender?.displayName || sender?.username || 'Unknown',
                content: msg.content,
                readBy: msg.readBy,
                sentAt: msg.sentAt.toISOString(),
            };
        });
    }
    async markRead(messageId, userId, log) {
        const start = Date.now();
        const childLog = log.child({ module: 'MessageService', messageId });
        const message = await this.repo.findOneBy({ _id: new mongodb_1.ObjectId(messageId) });
        if (!message) {
            throw new AppError_1.NotFoundError('Message not found.', 'MESSAGE_NOT_FOUND');
        }
        if (!message.readBy.includes(userId)) {
            message.readBy = [...message.readBy, userId];
            await this.repo.save(message);
        }
        (0, canonicalLog_1.logCanonical)(childLog, {
            event: 'message.read',
            status: 'success',
            durationMs: Date.now() - start,
            readerId: userId,
        });
        return message;
    }
    async toResponse(msg, log) {
        const childLog = log.child({ module: 'MessageService', action: 'toResponse', messageId: String(msg._id) });
        const userRepo = db_1.AppDataSource.getMongoRepository('User');
        const sender = await userRepo.findOneBy({ _id: new mongodb_1.ObjectId(msg.senderId) });
        if (!sender) {
            childLog.warn('Sender not found for message', { senderId: msg.senderId });
        }
        return {
            messageId: String(msg._id),
            conversationId: msg.conversationId,
            senderId: msg.senderId,
            receiverId: msg.receiverId,
            senderUsername: sender?.username || 'unknown',
            senderDisplayName: sender?.displayName || sender?.username || 'Unknown',
            content: msg.content,
            readBy: msg.readBy,
            sentAt: msg.sentAt.toISOString(),
        };
    }
}
exports.MessageService = MessageService;
exports.messageService = new MessageService();
