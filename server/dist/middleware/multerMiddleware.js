"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.avatarUpload = void 0;
const multer_1 = __importDefault(require("multer"));
const AppError_1 = require("../errors/AppError");
const AVATAR_MAX_BYTES = 1 * 1024 * 1024; // 1MB
exports.avatarUpload = (0, multer_1.default)({
    storage: multer_1.default.memoryStorage(),
    limits: { fileSize: AVATAR_MAX_BYTES },
    fileFilter: (_req, file, cb) => {
        const allowed = ['image/jpeg', 'image/png', 'image/webp'];
        if (!allowed.includes(file.mimetype)) {
            cb(new AppError_1.ValidationError('Avatar must be JPEG, PNG, or WebP.', 'AVATAR_INVALID_TYPE'));
            return;
        }
        cb(null, true);
    },
});
