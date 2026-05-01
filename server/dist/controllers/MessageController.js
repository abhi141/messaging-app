"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MessageController = void 0;
const tsoa_1 = require("tsoa");
const MessageService_1 = require("../services/MessageService");
const logger_1 = require("../config/logger");
let MessageController = class MessageController extends tsoa_1.Controller {
    /**
     * Get paginated message history with a specific user.
     */
    async getMessages(receiverId, req, page, limit) {
        const conversationId = MessageService_1.messageService.computeConversationId(req.user.userId, receiverId);
        return MessageService_1.messageService.getMessages(conversationId, page, limit, req.log);
    }
    /**
     * Full-text search messages with a specific user.
     */
    async searchMessages(receiverId, req, q) {
        const conversationId = MessageService_1.messageService.computeConversationId(req.user.userId, receiverId);
        return MessageService_1.messageService.searchMessages(conversationId, q, req.log);
    }
    /**
     * Mark a message as read.
     */
    async markRead(messageId, req) {
        await MessageService_1.messageService.markRead(messageId, req.user.userId, logger_1.rootLogger);
        return { success: true };
    }
};
exports.MessageController = MessageController;
__decorate([
    (0, tsoa_1.Get)('{receiverId}'),
    __param(0, (0, tsoa_1.Path)()),
    __param(1, (0, tsoa_1.Request)()),
    __param(2, (0, tsoa_1.Query)()),
    __param(3, (0, tsoa_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Number, Number]),
    __metadata("design:returntype", Promise)
], MessageController.prototype, "getMessages", null);
__decorate([
    (0, tsoa_1.Get)('{receiverId}/search'),
    __param(0, (0, tsoa_1.Path)()),
    __param(1, (0, tsoa_1.Request)()),
    __param(2, (0, tsoa_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, String]),
    __metadata("design:returntype", Promise)
], MessageController.prototype, "searchMessages", null);
__decorate([
    (0, tsoa_1.Patch)('{messageId}/read'),
    __param(0, (0, tsoa_1.Path)()),
    __param(1, (0, tsoa_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], MessageController.prototype, "markRead", null);
exports.MessageController = MessageController = __decorate([
    (0, tsoa_1.Route)('messages'),
    (0, tsoa_1.Tags)('Messages'),
    (0, tsoa_1.Security)('bearerAuth')
], MessageController);
