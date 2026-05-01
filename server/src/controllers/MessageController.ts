import {
  Controller,
  Get,
  Patch,
  Route,
  Tags,
  Path,
  Query,
  Security,
  Request,
} from 'tsoa';
import { MessageResponse } from '../dtos/message.dto';
import { messageService } from '../services/MessageService';
import { rootLogger } from '../config/logger';
import { RequestContext } from '../types/requestContext';

@Route('messages')
@Tags('Messages')
@Security('bearerAuth')
export class MessageController extends Controller {
  /**
   * Get paginated message history with a specific user.
   */
  @Get('{receiverId}')
  public async getMessages(
    @Path() receiverId: string,
    @Request() req: RequestContext,
    @Query() page?: number,
    @Query() limit?: number,
  ): Promise<MessageResponse[]> {
    const conversationId = messageService.computeConversationId(req.user.userId, receiverId);
    return messageService.getMessages(conversationId, page, limit, req.log);
  }

  /**
   * Full-text search messages with a specific user.
   */
  @Get('{receiverId}/search')
  public async searchMessages(
    @Path() receiverId: string,
    @Request() req: RequestContext,
    @Query() q: string,
  ): Promise<MessageResponse[]> {
    const conversationId = messageService.computeConversationId(req.user.userId, receiverId);
    return messageService.searchMessages(conversationId, q, req.log);
  }

  /**
   * Mark a message as read.
   */
  @Patch('{messageId}/read')
  public async markRead(
    @Path() messageId: string,
    @Request() req: RequestContext,
  ): Promise<{ success: boolean }> {
    await messageService.markRead(messageId, req.user.userId, rootLogger);
    return { success: true };
  }
}
