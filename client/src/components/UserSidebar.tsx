import { useState } from 'react';
import { LogOut, Search, X } from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { useChatStore } from '../store/chatStore';
import { cn } from '../utils/cn';
import { useNavigate } from 'react-router-dom';
import { ConnectionBanner } from './ConnectionBanner';
import { UserBadge } from './UserBadge';

interface UserSidebarProps {
  className?: string;
  onSelectUser?: () => void;
  onClose?: () => void;
}

export function UserSidebar({ className, onSelectUser, onClose }: UserSidebarProps) {
  const { user, logout } = useAuthStore();
  const { users, activeUserId, setActiveUserId } = useChatStore();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');

  const filteredUsers = users.filter(u => 
    u.displayName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.username.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className={cn("glass-card overflow-hidden border-white/5", className)}>
      <div className="p-4 border-b border-white/5 flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button 
              onClick={onClose}
              className="md:hidden p-1.5 text-text-muted hover:text-white transition-colors rounded-lg hover:bg-white/5"
            >
              <X className="w-5 h-5" />
            </button>
            <h2 className="text-xl font-bold text-white tracking-tight">Direct Messages</h2>
          </div>
          <ConnectionBanner />
        </div>
        
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
          <input 
            type="text" 
            placeholder="Search users..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white/5 border border-white/10 rounded-xl py-2 pl-9 pr-4 text-sm text-white placeholder-text-muted focus:outline-none focus:border-primary-start transition-colors"
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-2 space-y-1">
        {filteredUsers.length === 0 && (
          <div className="p-4 text-center text-sm text-text-muted">
            {searchQuery ? `No users matching "${searchQuery}"` : "No other users found"}
          </div>
        )}
        {filteredUsers.map(u => (
          <button
            key={u.userId}
            onClick={() => {
              setActiveUserId(u.userId);
              onSelectUser?.();
            }}
            className={cn(
              "w-full flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-200 text-left",
              activeUserId === u.userId 
                ? "bg-primary-start/20 text-white shadow-sm border border-primary-start/30" 
                : "text-text-muted hover:bg-white/5 hover:text-white"
            )}
          >
            <div className={cn(
              "w-10 h-10 rounded-lg flex items-center justify-center shrink-0 transition-colors relative",
              activeUserId === u.userId ? "bg-primary-start/30 text-white" : "bg-white/5 text-text-muted"
            )}>
              {u.displayName.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-medium truncate">
                {u.displayName} {u.userId === user?.userId && <span className="text-[10px] opacity-60 font-normal ml-1">(me)</span>}
              </div>
              <div className="text-xs opacity-70 truncate">@{u.username}</div>
            </div>
          </button>
        ))}
      </div>

      <div className="p-4 border-t border-white/5 bg-black/20 backdrop-blur-md flex items-center justify-between">
        {user && <UserBadge user={user} onClick={() => navigate('/profile')} />}
        <button 
          onClick={handleLogout}
          className="p-2 text-text-muted hover:text-error hover:bg-error/10 rounded-lg transition-colors"
          title="Sign Out"
        >
          <LogOut className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}
