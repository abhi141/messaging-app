"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authService = exports.AuthService = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const db_1 = require("../config/db");
const User_1 = require("../entities/User");
const env_1 = require("../config/env");
const AppError_1 = require("../errors/AppError");
const canonicalLog_1 = require("../utils/canonicalLog");
const SALT_ROUNDS = 10;
const USERNAME_MAX = 30;
const PASSWORD_MIN = 6;
class AuthService {
    get repo() {
        return db_1.AppDataSource.getMongoRepository(User_1.User);
    }
    async register(body, log) {
        const start = Date.now();
        const childLog = log.child({ module: 'AuthService', username: body.username });
        if (!body.username || body.username.length > USERNAME_MAX) {
            throw new AppError_1.ValidationError(`Username must be 1–${USERNAME_MAX} characters.`, 'VALIDATION_ERROR');
        }
        if (!body.password || body.password.length < PASSWORD_MIN) {
            throw new AppError_1.ValidationError(`Password must be at least ${PASSWORD_MIN} characters.`, 'VALIDATION_ERROR');
        }
        const existing = await this.repo.findOneBy({ username: body.username });
        if (existing) {
            (0, canonicalLog_1.logCanonical)(childLog, { event: 'auth.register', status: 'error', durationMs: Date.now() - start, errorCode: 'CONFLICT', errorMessage: 'Username taken' });
            throw new AppError_1.ConflictError('That username is already taken.', 'USERNAME_TAKEN');
        }
        const passwordHash = await bcryptjs_1.default.hash(body.password, SALT_ROUNDS);
        const user = this.repo.create({
            username: body.username,
            passwordHash,
            displayName: body.displayName ?? body.username,
            bio: '',
        });
        const saved = await this.repo.save(user);
        const token = this.signToken(saved);
        (0, canonicalLog_1.logCanonical)(childLog, { event: 'auth.register', status: 'success', durationMs: Date.now() - start, userId: String(saved._id) });
        return {
            token,
            user: {
                userId: String(saved._id),
                username: saved.username,
                displayName: saved.displayName ?? saved.username,
            },
        };
    }
    async login(username, password, log) {
        const start = Date.now();
        const childLog = log.child({ module: 'AuthService', username });
        const user = await this.repo.findOneBy({ username });
        if (!user) {
            (0, canonicalLog_1.logCanonical)(childLog, { event: 'auth.login', status: 'error', durationMs: Date.now() - start, errorCode: 'AUTH_FAILED' });
            throw new AppError_1.AuthError('Incorrect username or password.', 'AUTH_INVALID_CREDENTIALS');
        }
        const valid = await bcryptjs_1.default.compare(password, user.passwordHash);
        if (!valid) {
            (0, canonicalLog_1.logCanonical)(childLog, { event: 'auth.login', status: 'error', durationMs: Date.now() - start, errorCode: 'AUTH_FAILED' });
            throw new AppError_1.AuthError('Incorrect username or password.', 'AUTH_INVALID_CREDENTIALS');
        }
        const token = this.signToken(user);
        (0, canonicalLog_1.logCanonical)(childLog, { event: 'auth.login', status: 'success', durationMs: Date.now() - start, userId: String(user._id) });
        return {
            token,
            user: {
                userId: String(user._id),
                username: user.username,
                displayName: user.displayName ?? user.username,
            },
        };
    }
    verifyToken(token) {
        return jsonwebtoken_1.default.verify(token, env_1.env.JWT_SECRET);
    }
    signToken(user) {
        const payload = {
            userId: String(user._id),
            username: user.username,
            displayName: user.displayName ?? user.username,
        };
        return jsonwebtoken_1.default.sign(payload, env_1.env.JWT_SECRET, { expiresIn: env_1.env.JWT_EXPIRES_IN });
    }
}
exports.AuthService = AuthService;
exports.authService = new AuthService();
