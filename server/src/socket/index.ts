import { Server as HttpServer } from 'http';
import { Server } from 'socket.io';
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import { env } from '../config/env';
import { JwtPayload } from '../dtos/auth.dto';
import { createLogger } from '../utils/createLogger';
import { logCanonical } from '../utils/canonicalLog';
import { registerChatHandler } from './handlers/chatHandler';

export function initSocketServer(httpServer: HttpServer): Server {
  const io = new Server(httpServer, {
    cors: {
      origin: env.CLIENT_URL,
      methods: ['GET', 'POST'],
    },
  });

  // JWT auth middleware
  io.use((socket, next) => {
    const token = socket.handshake.auth.token as string | undefined;
    if (!token) {
      return next(new Error('Authentication error: missing token'));
    }
    try {
      const payload = jwt.verify(token, env.JWT_SECRET) as JwtPayload;
      socket.data.userId = payload.userId;
      socket.data.username = payload.username;
      socket.data.displayName = payload.displayName;
      socket.data.correlationId = (socket.handshake.auth.correlationId as string | undefined) ?? `cid_${uuidv4()}`;
      socket.data.log = createLogger({
        module: 'socket',
        correlationId: socket.data.correlationId as string,
        socketId: socket.id,
        userId: payload.userId,
      });
      next();
    } catch {
      next(new Error('Authentication error: invalid token'));
    }
  });

  io.on('connection', (socket) => {
    const start = Date.now();
    const log = socket.data.log;

    logCanonical(log, {
      event: 'socket.connect',
      status: 'success',
      durationMs: Date.now() - start,
      socketId: socket.id,
      userId: socket.data.userId as string,
    });

    // Auto-join personal room for direct messages
    const userId = socket.data.userId as string;
    socket.join(userId);

    registerChatHandler(io, socket);

    socket.on('disconnect', (reason) => {
      logCanonical(log, {
        event: 'socket.disconnect',
        status: 'success',
        durationMs: 0,
        socketId: socket.id,
        userId: socket.data.userId as string,
        reason,
      });
    });
  });

  return io;
}
