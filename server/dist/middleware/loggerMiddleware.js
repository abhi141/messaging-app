"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.loggerMiddleware = loggerMiddleware;
const uuid_1 = require("uuid");
const createLogger_1 = require("../utils/createLogger");
const canonicalLog_1 = require("../utils/canonicalLog");
function loggerMiddleware(req, res, next) {
    const correlationId = req.headers['x-correlation-id'] ?? `cid_${(0, uuid_1.v4)()}`;
    res.setHeader('x-correlation-id', correlationId);
    req.correlationId = correlationId;
    req.log = (0, createLogger_1.createLogger)({ module: 'http', correlationId });
    const start = Date.now();
    res.on('finish', () => {
        (0, canonicalLog_1.logCanonical)(req.log, {
            event: 'http.request',
            status: res.statusCode < 500 ? 'success' : 'error',
            durationMs: Date.now() - start,
            method: req.method,
            path: req.path,
            statusCode: res.statusCode,
            userId: req.user?.userId,
        });
    });
    next();
}
