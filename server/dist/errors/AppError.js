"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.InternalError = exports.RateLimitError = exports.ConflictError = exports.NotFoundError = exports.ForbiddenError = exports.AuthError = exports.ValidationError = exports.AppError = void 0;
class AppError extends Error {
    constructor(message, statusCode, code, isOperational = true) {
        super(message);
        this.statusCode = statusCode;
        this.code = code;
        this.isOperational = isOperational;
        Object.setPrototypeOf(this, new.target.prototype);
        Error.captureStackTrace(this, this.constructor);
    }
}
exports.AppError = AppError;
class ValidationError extends AppError {
    constructor(message, code = 'VALIDATION_ERROR') {
        super(message, 400, code);
    }
}
exports.ValidationError = ValidationError;
class AuthError extends AppError {
    constructor(message, code = 'AUTH_ERROR') {
        super(message, 401, code);
    }
}
exports.AuthError = AuthError;
class ForbiddenError extends AppError {
    constructor(message, code = 'FORBIDDEN') {
        super(message, 403, code);
    }
}
exports.ForbiddenError = ForbiddenError;
class NotFoundError extends AppError {
    constructor(message, code = 'NOT_FOUND') {
        super(message, 404, code);
    }
}
exports.NotFoundError = NotFoundError;
class ConflictError extends AppError {
    constructor(message, code = 'CONFLICT') {
        super(message, 409, code);
    }
}
exports.ConflictError = ConflictError;
class RateLimitError extends AppError {
    constructor(message, code = 'RATE_LIMIT') {
        super(message, 429, code);
    }
}
exports.RateLimitError = RateLimitError;
class InternalError extends AppError {
    constructor(message, code = 'INTERNAL_ERROR') {
        super(message, 500, code, false);
    }
}
exports.InternalError = InternalError;
