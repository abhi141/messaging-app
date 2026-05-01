import { AppDataSource } from '../config/db';
import { User } from '../entities/User';
import { ProfileResponse, PublicProfileResponse, UpdateProfileRequest } from '../dtos/profile.dto';
import { NotFoundError, ValidationError } from '../errors/AppError';
import { logCanonical } from '../utils/canonicalLog';
import { Logger } from 'winston';
import { MongoRepository } from 'typeorm';
import { ObjectId } from 'mongodb';

const AVATAR_MAX_BYTES = 1 * 1024 * 1024;
const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp'] as const;
const BIO_MAX_CHARS = 160;
const DISPLAY_NAME_MAX_CHARS = 50;

export class ProfileService {
  private get repo(): MongoRepository<User> {
    return AppDataSource.getMongoRepository(User);
  }

  async getOwnProfile(userId: string, log: Logger): Promise<ProfileResponse> {
    const childLog = log.child({ module: 'ProfileService', action: 'getOwnProfile', userId });
    const user = await this.findById(userId);
    childLog.info('Fetched own profile');
    return {
      userId: String(user._id),
      username: user.username,
      displayName: user.displayName ?? user.username,
      bio: user.bio ?? '',
      avatarBase64: user.avatarBase64,
      avatarMimeType: user.avatarMimeType,
      createdAt: user.createdAt.toISOString(),
      updatedAt: user.updatedAt.toISOString(),
    };
  }

  async getPublicProfile(userId: string, log: Logger): Promise<PublicProfileResponse> {
    const childLog = log.child({ module: 'ProfileService', action: 'getPublicProfile', targetUserId: userId });
    const user = await this.findById(userId);
    childLog.info('Fetched public profile');
    return {
      userId: String(user._id),
      username: user.username,
      displayName: user.displayName ?? user.username,
      bio: user.bio ?? '',
      avatarBase64: user.avatarBase64,
      avatarMimeType: user.avatarMimeType,
    };
  }

  async updateProfile(userId: string, body: UpdateProfileRequest, log: Logger): Promise<ProfileResponse> {
    const start = Date.now();
    const childLog = log.child({ module: 'ProfileService', userId });

    const user = await this.findById(userId);
    const fieldsChanged: string[] = [];

    if (body.displayName !== undefined) {
      if (body.displayName.length > DISPLAY_NAME_MAX_CHARS) {
        throw new ValidationError(`Display name must be ${DISPLAY_NAME_MAX_CHARS} characters or fewer.`, 'VALIDATION_ERROR');
      }
      user.displayName = body.displayName;
      fieldsChanged.push('displayName');
    }

    if (body.bio !== undefined) {
      if (body.bio.length > BIO_MAX_CHARS) {
        throw new ValidationError(`Bio must be ${BIO_MAX_CHARS} characters or fewer.`, 'VALIDATION_ERROR');
      }
      user.bio = body.bio;
      fieldsChanged.push('bio');
    }

    const saved = await this.repo.save(user);
    logCanonical(childLog, { event: 'profile.update', status: 'success', durationMs: Date.now() - start, fieldsChanged });

    return {
      userId: String(saved._id),
      username: saved.username,
      displayName: saved.displayName ?? saved.username,
      bio: saved.bio ?? '',
      avatarBase64: saved.avatarBase64,
      avatarMimeType: saved.avatarMimeType,
      createdAt: saved.createdAt.toISOString(),
      updatedAt: saved.updatedAt.toISOString(),
    };
  }

  async uploadAvatar(userId: string, file: Express.Multer.File, log: Logger): Promise<ProfileResponse> {
    const start = Date.now();
    const childLog = log.child({ module: 'ProfileService', userId });

    if (file.size > AVATAR_MAX_BYTES) {
      throw new ValidationError('Avatar must be under 1MB.', 'AVATAR_TOO_LARGE');
    }
    if (!(ALLOWED_MIME_TYPES as readonly string[]).includes(file.mimetype)) {
      throw new ValidationError('Avatar must be JPEG, PNG, or WebP.', 'AVATAR_INVALID_TYPE');
    }

    const user = await this.findById(userId);
    user.avatarBase64 = file.buffer.toString('base64');
    user.avatarMimeType = file.mimetype;

    const saved = await this.repo.save(user);
    logCanonical(childLog, {
      event: 'profile.avatar.upload',
      status: 'success',
      durationMs: Date.now() - start,
      mimeType: file.mimetype,
      sizeBytes: file.size,
    });

    return {
      userId: String(saved._id),
      username: saved.username,
      displayName: saved.displayName ?? saved.username,
      bio: saved.bio ?? '',
      avatarBase64: saved.avatarBase64,
      avatarMimeType: saved.avatarMimeType,
      createdAt: saved.createdAt.toISOString(),
      updatedAt: saved.updatedAt.toISOString(),
    };
  }

  async deleteAvatar(userId: string, log: Logger): Promise<void> {
    const start = Date.now();
    const childLog = log.child({ module: 'ProfileService', userId });

    const user = await this.findById(userId);
    user.avatarBase64 = undefined;
    user.avatarMimeType = undefined;
    await this.repo.save(user);

    logCanonical(childLog, { event: 'profile.avatar.delete', status: 'success', durationMs: Date.now() - start });
  }

  private async findById(userId: string): Promise<User> {
    const user = await this.repo.findOneBy({ _id: new ObjectId(userId) });
    if (!user) throw new NotFoundError('User not found.', 'USER_NOT_FOUND');
    return user;
  }
}

export const profileService = new ProfileService();
