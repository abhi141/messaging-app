"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.initSocketServer = initSocketServer;
const socket_io_1 = require("socket.io");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const uuid_1 = require("uuid");
const env_1 = require("../config/env");
const createLogger_1 = require("../utils/createLogger");
const canonicalLog_1 = require("../utils/canonicalLog");
const chatHandler_1 = require("./handlers/chatHandler");
function initSocketServer(httpServer) {
    const io = new socket_io_1.Server(httpServer, {
        cors: {
            origin: env_1.env.CLIENT_URL,
            methods: ['GET', 'POST'],
        },
    });
    // JWT auth middleware
    io.use((socket, next) => {
        const token = socket.handshake.auth.token;
        if (!token) {
            return next(new Error('Authentication error: missing token'));
        }
        try {
            const payload = jsonwebtoken_1.default.verify(token, env_1.env.JWT_SECRET);
            socket.data.userId = payload.userId;
            socket.data.username = payload.username;
            socket.data.displayName = payload.displayName;
            socket.data.correlationId = socket.handshake.auth.correlationId ?? `cid_${(0, uuid_1.v4)()}`;
            socket.data.log = (0, createLogger_1.createLogger)({
                module: 'socket',
                correlationId: socket.data.correlationId,
                socketId: socket.id,
                userId: payload.userId,
            });
            next();
        }
        catch {
            next(new Error('Authentication error: invalid token'));
        }
    });
    io.on('connection', (socket) => {
        const start = Date.now();
        const log = socket.data.log;
        (0, canonicalLog_1.logCanonical)(log, {
            event: 'socket.connect',
            status: 'success',
            durationMs: Date.now() - start,
            socketId: socket.id,
            userId: socket.data.userId,
        });
        // Auto-join personal room for direct messages
        const userId = socket.data.userId;
        socket.join(userId);
        (0, chatHandler_1.registerChatHandler)(io, socket);
        socket.on('disconnect', (reason) => {
            (0, canonicalLog_1.logCanonical)(log, {
                event: 'socket.disconnect',
                status: 'success',
                durationMs: 0,
                socketId: socket.id,
                userId: socket.data.userId,
                reason,
            });
        });
    });
    return io;
}
