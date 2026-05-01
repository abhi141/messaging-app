import { useEffect, useRef, useLayoutEffect, useState } from 'react';
import { format } from 'date-fns';
import type { Message } from '../types';
import { cn } from '../utils/cn';
import { Check, CheckCheck, Loader2 } from 'lucide-react';
import { useSocket } from '../hooks/useSocket';
import { SocketEvent } from '../enums/SocketEvent';

interface MessageListProps {
  messages: Message[];
  currentUserId: string;
  receiverId: string;
  conversationId: string;
  onLoadMore?: () => void;
  hasMore?: boolean;
  isLoadingMore?: boolean;
}

export function MessageList({ 
  messages, 
  currentUserId, 
  receiverId, 
  onLoadMore,
  hasMore,
  isLoadingMore
}: MessageListProps) {
  const bottomRef = useRef<HTMLDivElement>(null);
  const topRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const socketRef = useSocket();
  const [prevScrollHeight, setPrevScrollHeight] = useState<number | null>(null);

  // Intersection Observer for Infinite Scroll
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !isLoadingMore && onLoadMore) {
          // Record scroll height before loading more
          if (containerRef.current) {
            setPrevScrollHeight(containerRef.current.scrollHeight);
          }
          onLoadMore();
        }
      },
      { threshold: 0.5 }
    );

    const topEl = topRef.current;
    if (topEl) observer.observe(topEl);

    return () => {
      if (topEl) observer.unobserve(topEl);
    };
  }, [hasMore, isLoadingMore, onLoadMore]);

  // Scroll preservation when prepending older messages
  useLayoutEffect(() => {
    if (prevScrollHeight !== null && containerRef.current) {
      const scrollDiff = containerRef.current.scrollHeight - prevScrollHeight;
      containerRef.current.scrollTop += scrollDiff;
      setPrevScrollHeight(null); // Reset
    }
  }, [messages, prevScrollHeight]);

  // Scroll to bottom ONLY on new messages (when user is already near bottom or sending)
  // We approximate "new message" if prevScrollHeight is null
  useEffect(() => {
    if (prevScrollHeight === null) {
      bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages.length, prevScrollHeight]);

  // Mark unread messages as read
  useEffect(() => {
    const unreadMessages = messages.filter(m => !m.readBy.includes(currentUserId));
    
    if (unreadMessages.length > 0 && socketRef.current) {
      unreadMessages.forEach(msg => {
        socketRef.current?.emit(SocketEvent.MARK_READ, {
          receiverId,
          messageId: msg.messageId
        });
      });
    }
  }, [messages, currentUserId, receiverId, socketRef]);

  if (messages.length === 0 && !isLoadingMore) {
    return (
      <div className="absolute inset-0 flex items-center justify-center text-text-muted">
        <p>No messages yet. Be the first to say hello!</p>
      </div>
    );
  }

  return (
    <div ref={containerRef} className="absolute inset-0 overflow-y-auto p-4 space-y-6">
      <div ref={topRef} className="h-1" />
      {isLoadingMore && (
        <div className="flex justify-center my-2">
          <Loader2 className="w-5 h-5 text-primary-start animate-spin" />
        </div>
      )}
      {messages.map((message, idx) => {
        const isMe = message.senderId === currentUserId;
        const showAvatar = !isMe && (idx === 0 || messages[idx - 1].senderId !== message.senderId);
        const isRead = message.readBy.length > 1; // Sender + at least 1 other
        
        const date = new Date(message.sentAt);
        const formattedTime = format(date, 'h:mm a');

        return (
          <div 
            key={message.messageId} 
            className={cn("flex w-full", isMe ? "justify-end" : "justify-start")}
          >
            <div className={cn("flex max-w-[80%] md:max-w-[70%] gap-3", isMe ? "flex-row-reverse" : "flex-row")}>
              
              {/* Avatar Space */}
              {!isMe && (
                <div className="w-8 shrink-0">
                  {showAvatar && (
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white font-bold text-xs shadow-md">
                      {message.senderDisplayName.charAt(0).toUpperCase()}
                    </div>
                  )}
                </div>
              )}

              <div className={cn("flex flex-col", isMe ? "items-end" : "items-start")}>
                {/* Sender Name */}
                {showAvatar && (
                  <span className="text-xs font-medium text-text-muted mb-1 ml-1">
                    {message.senderDisplayName}
                  </span>
                )}
                
                {/* Message Bubble */}
                <div className={cn(
                  "px-4 py-2.5 rounded-2xl relative group",
                  isMe 
                    ? "bg-primary-start text-white rounded-br-sm shadow-md shadow-primary-start/20" 
                    : "bg-white/10 text-white rounded-bl-sm border border-white/5 shadow-sm"
                )}>
                  <p className="leading-relaxed break-words">{message.content}</p>
                  
                  {/* Timestamp & Read Receipt */}
                  <div className={cn(
                    "flex items-center gap-1 mt-1 text-[10px]",
                    isMe ? "text-white/70 justify-end" : "text-white/50 justify-start"
                  )}>
                    <span>{formattedTime}</span>
                    {isMe && (
                      <span>
                        {isRead ? <CheckCheck className="w-3 h-3 text-blue-200" /> : <Check className="w-3 h-3 opacity-70" />}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      })}
      <div ref={bottomRef} className="h-1" />
    </div>
  );
}
