import { Wifi, WifiOff } from 'lucide-react';
import { useChatStore } from '../store/chatStore';

export function ConnectionBanner() {
  const isConnected = useChatStore(state => state.isConnected);

  if (isConnected) {
    return (
      <div className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-success/10 border border-success/20 text-success text-[10px] font-medium uppercase tracking-wider">
        <Wifi className="w-3 h-3" />
        <span>Connected</span>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-warning/10 border border-warning/20 text-warning text-[10px] font-medium uppercase tracking-wider animate-pulse">
      <WifiOff className="w-3 h-3" />
      <span>Reconnecting</span>
    </div>
  );
}
