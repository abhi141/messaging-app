export enum SocketEvent {
  // Client → Server
  JOIN_ROOM = 'join_room',
  LEAVE_ROOM = 'leave_room',
  SEND_MESSAGE = 'send_message',
  TYPING = 'typing',
  MARK_READ = 'mark_read',

  // Server → Client
  NEW_MESSAGE = 'new_message',
  USER_JOINED = 'user_joined',
  USER_LEFT = 'user_left',
  USER_TYPING = 'user_typing',
  MESSAGE_READ = 'message_read',
  ERROR = 'error',
}
