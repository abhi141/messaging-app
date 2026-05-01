"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.roomService = exports.RoomService = void 0;
const db_1 = require("../config/db");
const Room_1 = require("../entities/Room");
const AppError_1 = require("../errors/AppError");
const logger_1 = require("../config/logger");
const DEFAULT_ROOM_NAME = 'general';
class RoomService {
    get repo() {
        return db_1.AppDataSource.getMongoRepository(Room_1.Room);
    }
    async seedDefaultRoom() {
        const existing = await this.repo.findOneBy({ name: DEFAULT_ROOM_NAME });
        if (existing)
            return existing;
        const room = this.repo.create({ name: DEFAULT_ROOM_NAME, memberIds: [] });
        const saved = await this.repo.save(room);
        logger_1.rootLogger.info('Seeded default room', { roomId: String(saved._id), name: DEFAULT_ROOM_NAME });
        return saved;
    }
    async getRooms() {
        const rooms = await this.repo.find();
        return rooms.map(this.toResponse);
    }
    async getRoomById(roomId) {
        const rooms = await this.repo.find();
        const room = rooms.find(r => String(r._id) === roomId);
        if (!room)
            throw new AppError_1.NotFoundError('Room not found.', 'ROOM_NOT_FOUND');
        return room;
    }
    async createRoom(name, creatorId) {
        const room = this.repo.create({ name, memberIds: [creatorId] });
        const saved = await this.repo.save(room);
        return this.toResponse(saved);
    }
    toResponse(room) {
        return {
            roomId: String(room._id),
            name: room.name,
            memberIds: room.memberIds,
            createdAt: room.createdAt.toISOString(),
        };
    }
}
exports.RoomService = RoomService;
exports.roomService = new RoomService();
