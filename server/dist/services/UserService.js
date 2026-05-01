"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.userService = exports.UserService = void 0;
const db_1 = require("../config/db");
const User_1 = require("../entities/User");
class UserService {
    constructor() {
        this.repo = db_1.AppDataSource.getRepository(User_1.User);
    }
    async getAllUsers(log, excludeUserId) {
        const childLog = log.child({ module: 'UserService', action: 'getAllUsers' });
        const query = excludeUserId ? { _id: { $ne: excludeUserId } } : {};
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
exports.UserService = UserService;
exports.userService = new UserService();
