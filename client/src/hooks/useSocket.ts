import { useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuthStore } from '../store/authStore';
import { useChatStore } from '../store/chatStore';
import { SocketEvent } from '../enums/SocketEvent';
import type { Message } from '../types';

let socketInstance: Socket | null = null;

export function useSocket() {
  const socketRef = useRef<Socket | null>(socketInstance);
  const { token, user } = useAuthStore();
  const { setIsConnected, addMessage, markMessageRead, setTyping } = useChatStore();
  const typingTimeouts = useRef<Record<string, ReturnType<typeof setTimeout>>>({});

  useEffect(() => {
    if (!token || !user) return;

    if (!socketInstance) {
      const socketUrl = import.meta.env.VITE_SOCKET_URL || 'http://localhost:4000';
      socketInstance = io(socketUrl, {
        auth: { token },
        transports: ['websocket', 'polling'],
      });

      socketInstance.on(SocketEvent.CONNECT, () => {
        setIsConnected(true);
        console.log('Socket connected');
      });

      socketInstance.on(SocketEvent.DISCONNECT, () => {
        setIsConnected(false);
        console.log('Socket disconnected');
      });

      socketInstance.on(SocketEvent.ERROR, (error: any) => {
        console.error('Socket error:', error);
      });
    }

    socketRef.current = socketInstance;

    const handleNewMessage = (message: Message) => {
      addMessage(message);
    };

    const handleMessageRead = ({ messageId, conversationId, userId }: { messageId: string, conversationId: string, userId: string, readBy: string[] }) => {
      markMessageRead(conversationId, messageId, userId);
      console.log(`Message ${messageId} read by ${userId}`);
    };

    const handleUserTyping = ({ userId }: { userId: string }) => {
      setTyping(userId, true);
      
      if (typingTimeouts.current[userId]) {
        clearTimeout(typingTimeouts.current[userId]);
      }
      
      typingTimeouts.current[userId] = setTimeout(() => {
        setTyping(userId, false);
      }, 3000);
    };

    socketInstance.on(SocketEvent.NEW_MESSAGE, handleNewMessage);
    socketInstance.on(SocketEvent.MESSAGE_READ, handleMessageRead);
    socketInstance.on(SocketEvent.USER_TYPING, handleUserTyping);

    return () => {
      if (socketInstance) {
        socketInstance.off(SocketEvent.NEW_MESSAGE, handleNewMessage);
        socketInstance.off(SocketEvent.MESSAGE_READ, handleMessageRead);
        socketInstance.off(SocketEvent.USER_TYPING, handleUserTyping);
      }
      
      // Cleanup timeouts
      Object.values(typingTimeouts.current).forEach(clearTimeout);
    };
  }, [token, user, setIsConnected, addMessage, markMessageRead, setTyping]);

  return socketRef;
}
