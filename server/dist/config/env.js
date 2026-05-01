"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.env = void 0;
require("dotenv/config");
function requireEnv(key) {
    const value = process.env[key];
    if (!value) {
        throw new Error(`Missing required environment variable: ${key}`);
    }
    return value;
}
function optionalEnv(key, fallback) {
    return process.env[key] ?? fallback;
}
exports.env = {
    PORT: parseInt(optionalEnv('PORT', '4000'), 10),
    MONGODB_URI: optionalEnv('MONGODB_URI', 'mongodb://localhost:27017/chat_poc'),
    JWT_SECRET: requireEnv('JWT_SECRET'),
    JWT_EXPIRES_IN: optionalEnv('JWT_EXPIRES_IN', '1h'),
    NODE_ENV: optionalEnv('NODE_ENV', 'development'),
    LOG_LEVEL: optionalEnv('LOG_LEVEL', 'info'),
    CLIENT_URL: optionalEnv('CLIENT_URL', 'http://localhost:5173'),
};
