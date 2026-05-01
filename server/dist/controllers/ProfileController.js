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
exports.ProfileController = void 0;
const tsoa_1 = require("tsoa");
const ProfileService_1 = require("../services/ProfileService");
let ProfileController = class ProfileController extends tsoa_1.Controller {
    /**
     * Get the authenticated user's full profile (includes avatarBase64).
     */
    async getMyProfile(req) {
        return ProfileService_1.profileService.getOwnProfile(req.user.userId, req.log);
    }
    /**
     * Update displayName and/or bio.
     */
    async updateProfile(body, req) {
        return ProfileService_1.profileService.updateProfile(req.user.userId, body, req.log);
    }
    /**
     * Upload avatar image (multipart, max 1MB, JPEG/PNG/WebP).
     */
    async uploadAvatar(avatar, req) {
        return ProfileService_1.profileService.uploadAvatar(req.user.userId, avatar, req.log);
    }
    /**
     * Remove the authenticated user's avatar.
     */
    async deleteAvatar(req) {
        await ProfileService_1.profileService.deleteAvatar(req.user.userId, req.log);
        return { success: true };
    }
    /**
     * Get another user's public profile.
     */
    async getPublicProfile(userId, req) {
        return ProfileService_1.profileService.getPublicProfile(userId, req.log);
    }
};
exports.ProfileController = ProfileController;
__decorate([
    (0, tsoa_1.Get)('me'),
    __param(0, (0, tsoa_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], ProfileController.prototype, "getMyProfile", null);
__decorate([
    (0, tsoa_1.Patch)('me'),
    __param(0, (0, tsoa_1.Body)()),
    __param(1, (0, tsoa_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], ProfileController.prototype, "updateProfile", null);
__decorate([
    (0, tsoa_1.Post)('me/avatar'),
    __param(0, (0, tsoa_1.UploadedFile)()),
    __param(1, (0, tsoa_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], ProfileController.prototype, "uploadAvatar", null);
__decorate([
    (0, tsoa_1.Delete)('me/avatar'),
    __param(0, (0, tsoa_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], ProfileController.prototype, "deleteAvatar", null);
__decorate([
    (0, tsoa_1.Get)('{userId}'),
    __param(0, (0, tsoa_1.Path)()),
    __param(1, (0, tsoa_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], ProfileController.prototype, "getPublicProfile", null);
exports.ProfileController = ProfileController = __decorate([
    (0, tsoa_1.Route)('profile'),
    (0, tsoa_1.Tags)('Profile'),
    (0, tsoa_1.Security)('bearerAuth')
], ProfileController);
