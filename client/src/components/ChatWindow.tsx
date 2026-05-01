import { useEffect, useState } from 'react';
import { Send, Image as ImageIcon, Smile, MoreVertical, Menu } from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { useChatStore } from '../store/chatStore';
import { api } from '../services/api';
import { useSocket } from '../hooks/useSocket';
import { SocketEvent } from '../enums/SocketEvent';
import { cn } from '../utils/cn';
import { MessageList } from './MessageList';

interface ChatWindowProps {
  className?: string;
  onToggleSidebar?: () => void;
}

export function ChatWindow({ className, onToggleSidebar }: ChatWindowProps) {
  const { activeUserId, messagesByConversation, setMessages, prependMessages, pageByConversation, hasMoreByConversation, users, isConnected, typingUsers } = useChatStore();
  const { user } = useAuthStore();
  const socketRef = useSocket();
  const [inputValue, setInputValue] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  const activeUser = users.find(u => u.userId === activeUserId);
  const conversationId = activeUserId && user ? [activeUserId, user.userId].sort().join('_') : null;
  const isTyping = activeUserId ? typingUsers[activeUserId] : false;
  
  const currentPage = conversationId ? (pageByConversation[conversationId] || 1) : 1;
  const hasMore = conversationId ? (hasMoreByConversation[conversationId] || false) : false;

  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showFeatureToast = (message: string) => {
    setToastMessage(message);
    setTimeout(() => {
      setToastMessage(null);
    }, 3000);
  };

  useEffect(() => {
    if (!activeUserId || !conversationId) return;

    const fetchHistory = async () => {
      try {
        const res = await api.get(`/messages/${activeUserId}`, { params: { page: 1, limit: 50 } });
        setMessages(conversationId, res.data, res.data.length === 50);
      } catch (err) {
        console.error('Failed to load message history', err);
      }
    };

    fetchHistory();
  }, [activeUserId, conversationId, setMessages, isConnected]);

  const fetchMore = async () => {
    if (!activeUserId || !conversationId || isLoadingMore || !hasMore) return;

    setIsLoadingMore(true);
    try {
      const nextPage = currentPage + 1;
      const res = await api.get(`/messages/${activeUserId}`, { params: { page: nextPage, limit: 50 } });
      prependMessages(conversationId, res.data, nextPage, res.data.length === 50);
    } catch (err) {
      console.error('Failed to load older messages', err);
    } finally {
      setIsLoadingMore(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
    
    if (activeUserId && socketRef.current) {
      socketRef.current.emit(SocketEvent.TYPING, { receiverId: activeUserId });
    }
  };

  const handleSend = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!inputValue.trim() || !activeUserId || !user) return;

    const content = inputValue.trim();
    setInputValue('');
    setIsSending(true);

    try {
      // Send via socket
      socketRef.current?.emit(SocketEvent.SEND_MESSAGE, {
        receiverId: activeUserId,
        content
      });
    } finally {
      setIsSending(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  if (!activeUserId) {
    return (
      <div className={cn("glass-card flex items-center justify-center border-white/5", className)}>
        <div className="text-center text-text-muted">
          <div className="w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Send className="w-8 h-8 opacity-50" />
          </div>
          <h3 className="text-lg font-medium text-white mb-1">No Chat Selected</h3>
          <p>Choose a user from the sidebar to start messaging</p>
        </div>
      </div>
    );
  }

  const messages = conversationId ? (messagesByConversation[conversationId] || []) : [];

  return (
    <div className={cn("glass-card border-white/5 overflow-hidden flex flex-col", className)}>
      {/* Header */}
      <div className="h-16 border-b border-white/5 px-4 sm:px-6 flex items-center justify-between bg-black/10 backdrop-blur-md shrink-0 z-10">
        <div className="flex items-center gap-3 sm:gap-4">
          <button 
            onClick={onToggleSidebar}
            className="md:hidden p-2 text-text-muted hover:text-white transition-colors rounded-lg hover:bg-white/5"
          >
            <Menu className="w-6 h-6" />
          </button>
          
          <div className="w-10 h-10 bg-primary-start/20 text-primary-start rounded-xl flex items-center justify-center font-bold text-lg relative">
            {activeUser?.displayName.charAt(0).toUpperCase() || '?'}
          </div>
          <div>
            <h2 className="font-bold text-white leading-tight">{activeUser?.displayName || 'Loading...'}</h2>
            <p className="text-xs text-text-muted h-4">
              {isTyping ? (
                <span className="text-primary-start animate-pulse italic">typing...</span>
              ) : (
                `${messages.length} messages`
              )}
            </p>
          </div>
        </div>
        <button className="p-2 text-text-muted hover:text-white transition-colors rounded-lg hover:bg-white/5">
          <MoreVertical className="w-5 h-5" />
        </button>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-hidden bg-black/5 relative">
        {conversationId && (
          <MessageList 
            messages={messages} 
            currentUserId={user?.userId || ''} 
            receiverId={activeUserId} 
            conversationId={conversationId} 
            onLoadMore={fetchMore}
            hasMore={hasMore}
            isLoadingMore={isLoadingMore}
          />
        )}
      </div>

      {/* Input Area */}
      <div className="p-4 bg-black/20 backdrop-blur-md border-t border-white/5 shrink-0 z-20 relative">
        {/* Custom Toast Notification */}
        <div 
          className={cn(
            "absolute left-1/2 -translate-x-1/2 -top-12 bg-white text-black px-4 py-2 rounded-full shadow-xl text-sm font-medium transition-all duration-300 pointer-events-none",
            toastMessage ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
          )}
        >
          {toastMessage}
        </div>

        <form
          onSubmit={handleSend}
          className="flex items-end gap-2 max-w-4xl mx-auto"
        >
          <div className="flex-1 bg-white/5 border border-white/10 rounded-2xl flex items-end transition-all focus-within:border-primary-start focus-within:bg-white/10 relative">
            <button type="button" className="p-3 text-text-muted hover:text-white transition-colors">
              <Smile className="w-5 h-5" />
            </button>
            <input
              type="text"
              value={inputValue}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              placeholder={`Message ${activeUser?.displayName || 'user'}...`}
              className="flex-1 bg-transparent py-3 px-2 outline-none text-white placeholder-text-muted"
            />
            <button 
              type="button" 
              className="p-3 text-text-muted hover:text-white transition-colors"
              onClick={() => showFeatureToast('Image upload feature is coming soon!')}
              title="Upload Image (Coming Soon)"
            >
              <ImageIcon className="w-5 h-5" />
            </button>
          </div>
          <button
            type="submit"
            disabled={!inputValue.trim() || isSending}
            className="w-12 h-12 rounded-2xl bg-gradient-primary text-white flex items-center justify-center shrink-0 disabled:opacity-50 transition-all hover:shadow-lg hover:shadow-primary-start/20 hover:scale-105 active:scale-95"
          >
            <Send className="w-5 h-5" />
          </button>
        </form>
      </div>
    </div>
  );
}
