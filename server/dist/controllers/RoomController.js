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
exports.RoomController = void 0;
const tsoa_1 = require("tsoa");
const RoomService_1 = require("../services/RoomService");
let RoomController = class RoomController extends tsoa_1.Controller {
    /**
     * List all chat rooms.
     */
    async getRooms() {
        return RoomService_1.roomService.getRooms();
    }
    /**
     * Create a new chat room.
     */
    async createRoom(body) {
        // Creator defaults to "system" for POC — rooms are global
        return RoomService_1.roomService.createRoom(body.name, 'system');
    }
};
exports.RoomController = RoomController;
__decorate([
    (0, tsoa_1.Get)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], RoomController.prototype, "getRooms", null);
__decorate([
    (0, tsoa_1.Post)(),
    __param(0, (0, tsoa_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], RoomController.prototype, "createRoom", null);
exports.RoomController = RoomController = __decorate([
    (0, tsoa_1.Route)('rooms'),
    (0, tsoa_1.Tags)('Rooms'),
    (0, tsoa_1.Security)('bearerAuth')
], RoomController);
