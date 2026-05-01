"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SocketEvent = void 0;
var SocketEvent;
(function (SocketEvent) {
    // Client → Server
    SocketEvent["JOIN_ROOM"] = "join_room";
    SocketEvent["LEAVE_ROOM"] = "leave_room";
    SocketEvent["SEND_MESSAGE"] = "send_message";
    SocketEvent["TYPING"] = "typing";
    SocketEvent["MARK_READ"] = "mark_read";
    // Server → Client
    SocketEvent["NEW_MESSAGE"] = "new_message";
    SocketEvent["USER_JOINED"] = "user_joined";
    SocketEvent["USER_LEFT"] = "user_left";
    SocketEvent["USER_TYPING"] = "user_typing";
    SocketEvent["MESSAGE_READ"] = "message_read";
    SocketEvent["ERROR"] = "error";
})(SocketEvent || (exports.SocketEvent = SocketEvent = {}));
