"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppDataSource = void 0;
const typeorm_1 = require("typeorm");
const User_1 = require("../entities/User");
const Message_1 = require("../entities/Message");
const env_1 = require("./env");
exports.AppDataSource = new typeorm_1.DataSource({
    type: 'mongodb',
    url: env_1.env.MONGODB_URI,
    synchronize: true,
    logging: env_1.env.NODE_ENV === 'development',
    entities: [User_1.User, Message_1.Message],
});
