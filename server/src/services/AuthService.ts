import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { AppDataSource } from '../config/db';
import { User } from '../entities/User';
import { env } from '../config/env';
import { AuthError, ConflictError, ValidationError } from '../errors/AppError';
import { JwtPayload, LoginResponse, RegisterRequest } from '../dtos/auth.dto';
import { logCanonical } from '../utils/canonicalLog';
import { Logger } from 'winston';
import { MongoRepository } from 'typeorm';

const SALT_ROUNDS = 10;
const USERNAME_MAX = 30;
const PASSWORD_MIN = 6;

export class AuthService {
  private get repo(): MongoRepository<User> {
    return AppDataSource.getMongoRepository(User);
  }

  async register(body: RegisterRequest, log: Logger): Promise<LoginResponse> {
    const start = Date.now();
    const childLog = log.child({ module: 'AuthService', username: body.username });

    if (!body.username || body.username.length > USERNAME_MAX) {
      throw new ValidationError(`Username must be 1–${USERNAME_MAX} characters.`, 'VALIDATION_ERROR');
    }
    if (!body.password || body.password.length < PASSWORD_MIN) {
      throw new ValidationError(`Password must be at least ${PASSWORD_MIN} characters.`, 'VALIDATION_ERROR');
    }

    const existing = await this.repo.findOneBy({ username: body.username });
    if (existing) {
      logCanonical(childLog, { event: 'auth.register', status: 'error', durationMs: Date.now() - start, errorCode: 'CONFLICT', errorMessage: 'Username taken' });
      throw new ConflictError('That username is already taken.', 'USERNAME_TAKEN');
    }

    const passwordHash = await bcrypt.hash(body.password, SALT_ROUNDS);
    const user = this.repo.create({
      username: body.username,
      passwordHash,
      displayName: body.displayName ?? body.username,
      bio: '',
    }) as User;
    const saved = await this.repo.save(user);

    const token = this.signToken(saved);
    logCanonical(childLog, { event: 'auth.register', status: 'success', durationMs: Date.now() - start, userId: String(saved._id) });

    return {
      token,
      user: {
        userId: String(saved._id),
        username: saved.username,
        displayName: saved.displayName ?? saved.username,
      },
    };
  }

  async login(username: string, password: string, log: Logger): Promise<LoginResponse> {
    const start = Date.now();
    const childLog = log.child({ module: 'AuthService', username });

    const user = await this.repo.findOneBy({ username });
    if (!user) {
      logCanonical(childLog, { event: 'auth.login', status: 'error', durationMs: Date.now() - start, errorCode: 'AUTH_FAILED' });
      throw new AuthError('Incorrect username or password.', 'AUTH_INVALID_CREDENTIALS');
    }

    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) {
      logCanonical(childLog, { event: 'auth.login', status: 'error', durationMs: Date.now() - start, errorCode: 'AUTH_FAILED' });
      throw new AuthError('Incorrect username or password.', 'AUTH_INVALID_CREDENTIALS');
    }

    const token = this.signToken(user);
    logCanonical(childLog, { event: 'auth.login', status: 'success', durationMs: Date.now() - start, userId: String(user._id) });

    return {
      token,
      user: {
        userId: String(user._id),
        username: user.username,
        displayName: user.displayName ?? user.username,
      },
    };
  }

  verifyToken(token: string): JwtPayload {
    return jwt.verify(token, env.JWT_SECRET) as JwtPayload;
  }

  private signToken(user: User): string {
    const payload: JwtPayload = {
      userId: String(user._id),
      username: user.username,
      displayName: user.displayName ?? user.username,
    };
    return jwt.sign(payload, env.JWT_SECRET, { expiresIn: env.JWT_EXPIRES_IN } as jwt.SignOptions);
  }
}

export const authService = new AuthService();
