import type { UserSummary } from '../types';
import { Settings } from 'lucide-react';

interface UserBadgeProps {
  user: UserSummary;
  onClick?: () => void;
}

export function UserBadge({ user, onClick }: UserBadgeProps) {
  return (
    <div 
      onClick={onClick}
      className="flex items-center gap-3 p-1.5 rounded-xl hover:bg-white/5 transition-colors cursor-pointer group"
    >
      <div className="w-9 h-9 rounded-full bg-gradient-primary flex items-center justify-center text-white font-bold shadow-md relative">
        {user.displayName.charAt(0).toUpperCase()}
        <div className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-success border-2 border-background"></div>
      </div>
      <div className="flex-1 min-w-0">
        <div className="font-medium text-sm text-white truncate">{user.displayName}</div>
        <div className="text-xs text-text-muted truncate">@{user.username}</div>
      </div>
      <Settings className="w-4 h-4 text-text-muted opacity-0 group-hover:opacity-100 transition-opacity" />
    </div>
  );
}
