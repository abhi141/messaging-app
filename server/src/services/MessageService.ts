import { AppDataSource } from '../config/db';
import { Message } from '../entities/Message';
import { NotFoundError, ValidationError } from '../errors/AppError';
import { MessageResponse } from '../dtos/message.dto';
import { logCanonical } from '../utils/canonicalLog';
import { Logger } from 'winston';
import { MongoRepository } from 'typeorm';
import { ObjectId } from 'mongodb';

const MAX_CONTENT_LENGTH = 2000;
const DEFAULT_PAGE_SIZE = 50;
const MAX_PAGE_SIZE = 100;

export class MessageService {
  private get repo(): MongoRepository<Message> {
    return AppDataSource.getMongoRepository(Message);
  }

  public computeConversationId(user1Id: string, user2Id: string): string {
    return [user1Id, user2Id].sort().join('_');
  }

  async sendMessage(
    receiverId: string,
    content: string,
    senderId: string,
    log: Logger,
  ): Promise<Message> {
    const start = Date.now();
    const conversationId = this.computeConversationId(senderId, receiverId);
    const childLog = log.child({ module: 'MessageService', conversationId });

    if (!content || content.trim().length === 0) {
      throw new ValidationError('Message cannot be empty.', 'EMPTY_MESSAGE');
    }
    if (content.length > MAX_CONTENT_LENGTH) {
      throw new ValidationError(`Message too long (max ${MAX_CONTENT_LENGTH} characters).`, 'MESSAGE_TOO_LONG');
    }

    const message = this.repo.create({
      conversationId,
      content: content.trim(),
      senderId,
      receiverId,
      readBy: [senderId],
    });

    const saved = await this.repo.save(message);
    logCanonical(childLog, {
      event: 'message.send',
      status: 'success',
      durationMs: Date.now() - start,
      messageId: String(saved._id),
    });

    return saved;
  }

  async getMessages(
    conversationId: string,
    page: number = 1,
    limit: number = DEFAULT_PAGE_SIZE,
    log: Logger,
  ): Promise<MessageResponse[]> {
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

  async searchMessages(conversationId: string, query: string, log: Logger): Promise<MessageResponse[]> {
    if (!query || query.trim().length === 0) return [];

    const messages = await this.repo.find({
      where: {
        conversationId,
        content: { $regex: query.trim(), $options: 'i' } as unknown as string,
      },
      order: { sentAt: 'DESC' },
      take: 50,
    });

    return this.populateMessages(messages, log);
  }

  private async populateMessages(messages: Message[], log: Logger): Promise<MessageResponse[]> {
    if (messages.length === 0) return [];
    const childLog = log.child({ module: 'MessageService', action: 'populateMessages' });

    const senderIds = Array.from(new Set(messages.map((m) => m.senderId)));
    const userRepo = AppDataSource.getMongoRepository('User');
    const users = await userRepo.find({
      where: {
        _id: { $in: senderIds.map((id) => new ObjectId(id)) } as any,
      },
    });

    const userMap = new Map(users.map((u: any) => [String(u._id), u]));

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

  async markRead(messageId: string, userId: string, log: Logger): Promise<Message> {
    const start = Date.now();
    const childLog = log.child({ module: 'MessageService', messageId });

    const message = await this.repo.findOneBy({ _id: new ObjectId(messageId) });
    if (!message) {
      throw new NotFoundError('Message not found.', 'MESSAGE_NOT_FOUND');
    }

    if (!message.readBy.includes(userId)) {
      message.readBy = [...message.readBy, userId];
      await this.repo.save(message);
    }

    logCanonical(childLog, {
      event: 'message.read',
      status: 'success',
      durationMs: Date.now() - start,
      readerId: userId,
    });

    return message;
  }

  async toResponse(msg: Message, log: Logger): Promise<MessageResponse> {
    const childLog = log.child({ module: 'MessageService', action: 'toResponse', messageId: String(msg._id) });
    const userRepo = AppDataSource.getMongoRepository('User');
    const sender: any = await userRepo.findOneBy({ _id: new ObjectId(msg.senderId) });

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

export const messageService = new MessageService();
