export const SocketEvent = {
  CONNECT: 'connect',
  DISCONNECT: 'disconnect',
  ERROR: 'error',

  JOIN_ROOM: 'join_room',
  LEAVE_ROOM: 'leave_room',

  SEND_MESSAGE: 'send_message',
  NEW_MESSAGE: 'new_message',

  USER_JOINED: 'user_joined',
  USER_LEFT: 'user_left',

  TYPING: 'typing',
  USER_TYPING: 'user_typing',

  MARK_READ: 'mark_read',
  MESSAGE_READ: 'message_read',
} as const;

export type SocketEvent = typeof SocketEvent[keyof typeof SocketEvent];
