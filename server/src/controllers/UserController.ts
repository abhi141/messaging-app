import { Route, Get, Tags, Request, Security } from 'tsoa';
import { userService } from '../services/UserService';
import { UserSummary } from '../dtos/auth.dto';
import { RequestContext } from '../types/requestContext';

@Route('users')
@Tags('Users')
export class UserController {
  /**
   * Get all registered users (excluding the current user).
   */
  @Get()
  @Security('bearerAuth')
  public async getUsers(@Request() req: RequestContext): Promise<UserSummary[]> {
    const currentUserId = req.user?.userId;
    return userService.getAllUsers(req.log, currentUserId);
  }
}
