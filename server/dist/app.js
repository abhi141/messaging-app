"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("reflect-metadata");
require("dotenv/config");
const express_1 = __importDefault(require("express"));
const http_1 = require("http");
const cors_1 = __importDefault(require("cors"));
const swagger_ui_express_1 = __importDefault(require("swagger-ui-express"));
const db_1 = require("./config/db");
const env_1 = require("./config/env");
const logger_1 = require("./config/logger");
const loggerMiddleware_1 = require("./middleware/loggerMiddleware");
const socket_1 = require("./socket");
const AppError_1 = require("./errors/AppError");
const swagger_json_1 = __importDefault(require("./generated/swagger.json"));
async function bootstrap() {
    // 1. Connect to MongoDB
    await db_1.AppDataSource.initialize();
    logger_1.rootLogger.info('MongoDB connected');
    // 3. Create Express app
    const app = (0, express_1.default)();
    app.use((0, cors_1.default)({ origin: env_1.env.CLIENT_URL, credentials: true }));
    app.use(express_1.default.json({ limit: '2mb' }));
    app.use(express_1.default.urlencoded({ extended: true }));
    app.use(loggerMiddleware_1.loggerMiddleware);
    // 4. Register TSOA-generated routes (generated after tsoa:gen)
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { RegisterRoutes } = require('./generated/routes');
    RegisterRoutes(app);
    // 5. Swagger UI
    app.use('/docs', swagger_ui_express_1.default.serve, swagger_ui_express_1.default.setup(swagger_json_1.default));
    // 6. Health check
    app.get('/health', (_req, res) => {
        res.json({ status: 'ok', timestamp: new Date().toISOString() });
    });
    // 7. Global error handler (last middleware)
    app.use((err, _req, res, _next) => {
        if (err instanceof AppError_1.AppError && err.isOperational) {
            logger_1.rootLogger.warn('Operational error', { code: err.code, status: err.statusCode, message: err.message });
            res.status(err.statusCode).json({ error: { code: err.code, message: err.message } });
        }
        else if (err.name === 'MulterError') {
            logger_1.rootLogger.warn('Multer error', { code: err.code, message: err.message });
            const message = err.code === 'LIMIT_FILE_SIZE' ? 'File is too large. Max size is 1MB.' : err.message;
            res.status(400).json({ error: { code: 'UPLOAD_ERROR', message } });
        }
        else {
            logger_1.rootLogger.error('Unexpected error', { err });
            res.status(500).json({ error: { code: 'INTERNAL_ERROR', message: 'Something went wrong' } });
        }
    });
    // 8. HTTP server + Socket.IO
    const httpServer = (0, http_1.createServer)(app);
    (0, socket_1.initSocketServer)(httpServer);
    // 9. Listen
    httpServer.listen(env_1.env.PORT, () => {
        logger_1.rootLogger.info(`Server listening on port ${env_1.env.PORT}`, {
            port: env_1.env.PORT,
            env: env_1.env.NODE_ENV,
            docs: `http://localhost:${env_1.env.PORT}/docs`,
        });
    });
}
bootstrap().catch((err) => {
    logger_1.rootLogger.error('Failed to start server', { err });
    process.exit(1);
});
