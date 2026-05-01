import { AppDataSource } from '../config/db';
import { User } from '../entities/User';
import { UserSummary } from '../dtos/auth.dto';
import { Logger } from 'winston';

export class UserService {
  private repo = AppDataSource.getRepository(User);

  public async getAllUsers(log: Logger, excludeUserId?: string): Promise<UserSummary[]> {
    const childLog = log.child({ module: 'UserService', action: 'getAllUsers' });
    const query = excludeUserId ? { _id: { $ne: excludeUserId } as any } : {};
    const users = await this.repo.find({ where: query });
    
    childLog.info(`Fetched ${users.length} users`);

    return users.map(user => ({
      userId: String(user._id),
      username: user.username,
      displayName: user.displayName ?? user.username,
      bio: user.bio,
      avatarBase64: user.avatarBase64,
      avatarMimeType: user.avatarMimeType
    }));
  }
}

export const userService = new UserService();
