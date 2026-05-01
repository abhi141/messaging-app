"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authMiddleware = authMiddleware;
exports.expressAuthentication = expressAuthentication;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const env_1 = require("../config/env");
const AppError_1 = require("../errors/AppError");
function authMiddleware(req, res, next) {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) {
        return next(new AppError_1.AuthError('Session required. Please log in.', 'AUTH_MISSING_TOKEN'));
    }
    const token = authHeader.slice(7);
    try {
        const payload = jsonwebtoken_1.default.verify(token, env_1.env.JWT_SECRET);
        req.user = payload;
        next();
    }
    catch (err) {
        if (err instanceof jsonwebtoken_1.default.TokenExpiredError) {
            return next(new AppError_1.AuthError('Session expired. Please log in again.', 'AUTH_TOKEN_EXPIRED'));
        }
        return next(new AppError_1.AuthError('Invalid session. Please log in again.', 'AUTH_INVALID_TOKEN'));
    }
}
/**
 * TSOA authentication handler — called by generated routes for @Security('bearerAuth').
 * Returns the decoded JWT payload which TSOA stores as req.user.
 */
async function expressAuthentication(req, securityName, _scopes) {
    if (securityName === 'bearerAuth') {
        const authHeader = req.headers.authorization;
        if (!authHeader?.startsWith('Bearer ')) {
            throw new AppError_1.AuthError('Session required. Please log in.', 'AUTH_MISSING_TOKEN');
        }
        const token = authHeader.slice(7);
        try {
            const payload = jsonwebtoken_1.default.verify(token, env_1.env.JWT_SECRET);
            req.user = payload;
            return payload;
        }
        catch (err) {
            if (err instanceof jsonwebtoken_1.default.TokenExpiredError) {
                throw new AppError_1.AuthError('Session expired. Please log in again.', 'AUTH_TOKEN_EXPIRED');
            }
            throw new AppError_1.AuthError('Invalid session. Please log in again.', 'AUTH_INVALID_TOKEN');
        }
    }
    throw new AppError_1.AuthError('Unknown security scheme.', 'AUTH_ERROR');
}
