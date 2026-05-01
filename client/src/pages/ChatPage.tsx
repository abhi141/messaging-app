import { useEffect, useState } from 'react';
import { api } from '../services/api';
import { useChatStore } from '../store/chatStore';
import { useSocket } from '../hooks/useSocket';
import { UserSidebar } from '../components/UserSidebar';
import { ChatWindow } from '../components/ChatWindow';
import { cn } from '../utils/cn';

export function ChatPage() {
  const { setUsers, setActiveUserId, isConnected } = useChatStore();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  useSocket(); // Initialize socket connection

  const fetchUsers = async () => {
    try {
      const res = await api.get('/users');
      setUsers(res.data);
      // Only set default if no active user is selected
      const currentActiveId = useChatStore.getState().activeUserId;
      if (!currentActiveId && res.data.length > 0) {
        setActiveUserId(res.data[0].userId);
      }
    } catch (err) {
      console.error('Failed to fetch users', err);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // Auto-refresh when socket connects
  useEffect(() => {
    if (isConnected) {
      console.log('Socket connected - refreshing data...');
      fetchUsers();
    }
  }, [isConnected]);

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);
  const closeSidebar = () => setIsSidebarOpen(false);

  return (
    <div className="h-screen flex overflow-hidden bg-background relative">
      {/* Decorative gradients */}
      <div className="absolute top-0 left-1/4 w-1/2 h-1/2 rounded-full bg-primary-start/10 blur-[150px] pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-1/2 h-1/2 rounded-full bg-primary-end/10 blur-[150px] pointer-events-none" />

      {/* Main Chat Layout Container */}
      <div className="flex w-full h-full p-2 sm:p-4 gap-2 sm:gap-4 relative z-10 max-w-[1600px] mx-auto">
        {/* Mobile Backdrop */}
        {isSidebarOpen && (
          <div 
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 md:hidden animate-fade-in"
            onClick={closeSidebar}
          />
        )}

        <UserSidebar 
          className={cn(
            "fixed inset-y-2 left-2 right-2 z-50 md:relative md:inset-0 md:flex flex-col w-auto md:w-80 shrink-0 transition-all duration-300 ease-in-out",
            isSidebarOpen ? "translate-x-0 opacity-100" : "-translate-x-full opacity-0 md:translate-x-0 md:opacity-100"
          )} 
          onSelectUser={closeSidebar}
          onClose={closeSidebar}
        />
        
        <ChatWindow 
          className="flex-1 flex flex-col w-full h-full" 
          onToggleSidebar={toggleSidebar}
        />
      </div>
    </div>
  );
}
