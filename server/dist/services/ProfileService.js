"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.profileService = exports.ProfileService = void 0;
const db_1 = require("../config/db");
const User_1 = require("../entities/User");
const AppError_1 = require("../errors/AppError");
const canonicalLog_1 = require("../utils/canonicalLog");
const mongodb_1 = require("mongodb");
const AVATAR_MAX_BYTES = 1 * 1024 * 1024;
const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const BIO_MAX_CHARS = 160;
const DISPLAY_NAME_MAX_CHARS = 50;
class ProfileService {
    get repo() {
        return db_1.AppDataSource.getMongoRepository(User_1.User);
    }
    async getOwnProfile(userId, log) {
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
    async getPublicProfile(userId, log) {
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
    async updateProfile(userId, body, log) {
        const start = Date.now();
        const childLog = log.child({ module: 'ProfileService', userId });
        const user = await this.findById(userId);
        const fieldsChanged = [];
        if (body.displayName !== undefined) {
            if (body.displayName.length > DISPLAY_NAME_MAX_CHARS) {
                throw new AppError_1.ValidationError(`Display name must be ${DISPLAY_NAME_MAX_CHARS} characters or fewer.`, 'VALIDATION_ERROR');
            }
            user.displayName = body.displayName;
            fieldsChanged.push('displayName');
        }
        if (body.bio !== undefined) {
            if (body.bio.length > BIO_MAX_CHARS) {
                throw new AppError_1.ValidationError(`Bio must be ${BIO_MAX_CHARS} characters or fewer.`, 'VALIDATION_ERROR');
            }
            user.bio = body.bio;
            fieldsChanged.push('bio');
        }
        const saved = await this.repo.save(user);
        (0, canonicalLog_1.logCanonical)(childLog, { event: 'profile.update', status: 'success', durationMs: Date.now() - start, fieldsChanged });
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
    async uploadAvatar(userId, file, log) {
        const start = Date.now();
        const childLog = log.child({ module: 'ProfileService', userId });
        if (file.size > AVATAR_MAX_BYTES) {
            throw new AppError_1.ValidationError('Avatar must be under 1MB.', 'AVATAR_TOO_LARGE');
        }
        if (!ALLOWED_MIME_TYPES.includes(file.mimetype)) {
            throw new AppError_1.ValidationError('Avatar must be JPEG, PNG, or WebP.', 'AVATAR_INVALID_TYPE');
        }
        const user = await this.findById(userId);
        user.avatarBase64 = file.buffer.toString('base64');
        user.avatarMimeType = file.mimetype;
        const saved = await this.repo.save(user);
        (0, canonicalLog_1.logCanonical)(childLog, {
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
    async deleteAvatar(userId, log) {
        const start = Date.now();
        const childLog = log.child({ module: 'ProfileService', userId });
        const user = await this.findById(userId);
        user.avatarBase64 = undefined;
        user.avatarMimeType = undefined;
        await this.repo.save(user);
        (0, canonicalLog_1.logCanonical)(childLog, { event: 'profile.avatar.delete', status: 'success', durationMs: Date.now() - start });
    }
    async findById(userId) {
        const user = await this.repo.findOneBy({ _id: new mongodb_1.ObjectId(userId) });
        if (!user)
            throw new AppError_1.NotFoundError('User not found.', 'USER_NOT_FOUND');
        return user;
    }
}
exports.ProfileService = ProfileService;
exports.profileService = new ProfileService();
