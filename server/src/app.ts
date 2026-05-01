import 'reflect-metadata';
import 'dotenv/config';
import express, { Request, Response, NextFunction } from 'express';
import { createServer } from 'http';
import cors from 'cors';
import swaggerUi from 'swagger-ui-express';
import { AppDataSource } from './config/db';
import { env } from './config/env';
import { rootLogger } from './config/logger';
import { loggerMiddleware } from './middleware/loggerMiddleware';
import { avatarUpload } from './middleware/multerMiddleware';
import { initSocketServer } from './socket';
import { AppError } from './errors/AppError';
import swaggerDocument from './generated/swagger.json';

async function bootstrap(): Promise<void> {
  // 1. Connect to MongoDB
  await AppDataSource.initialize();
  rootLogger.info('MongoDB connected');



  // 3. Create Express app
  const app = express();

  app.use(cors({ origin: env.CLIENT_URL, credentials: true }));
  app.use(express.json({ limit: '2mb' }));
  app.use(express.urlencoded({ extended: true }));
  app.use(loggerMiddleware);

  // 4. Register TSOA-generated routes (generated after tsoa:gen)
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { RegisterRoutes } = require('./generated/routes');
  RegisterRoutes(app);

  // 5. Swagger UI
  app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

  // 6. Health check
  app.get('/health', (_req: Request, res: Response) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  // 7. Global error handler (last middleware)
  app.use((err: any, _req: Request, res: Response, _next: NextFunction): void => {
    if (err instanceof AppError && err.isOperational) {
      rootLogger.warn('Operational error', { code: err.code, status: err.statusCode, message: err.message });
      res.status(err.statusCode).json({ error: { code: err.code, message: err.message } });
    } else if (err.name === 'MulterError') {
      rootLogger.warn('Multer error', { code: err.code, message: err.message });
      const message = err.code === 'LIMIT_FILE_SIZE' ? 'File is too large. Max size is 1MB.' : err.message;
      res.status(400).json({ error: { code: 'UPLOAD_ERROR', message } });
    } else {
      rootLogger.error('Unexpected error', { err });
      res.status(500).json({ error: { code: 'INTERNAL_ERROR', message: 'Something went wrong' } });
    }
  });

  // 8. HTTP server + Socket.IO
  const httpServer = createServer(app);
  initSocketServer(httpServer);

  // 9. Listen
  httpServer.listen(env.PORT, () => {
    rootLogger.info(`Server listening on port ${env.PORT}`, {
      port: env.PORT,
      env: env.NODE_ENV,
      docs: `http://localhost:${env.PORT}/docs`,
    });
  });
}

bootstrap().catch((err: unknown) => {
  rootLogger.error('Failed to start server', { err });
  process.exit(1);
});
