import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { ProfileSettings } from '../components/profile/ProfileSettings';
import { AvatarUpload } from '../components/profile/AvatarUpload';

export function ProfilePage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background text-text-primary flex items-center justify-center p-4">
      <div className="w-full max-w-2xl animate-fade-in">
        {/* Back Button */}
        <button 
          onClick={() => navigate('/')}
          className="flex items-center gap-2 text-text-muted hover:text-white transition-colors mb-6 group"
        >
          <ArrowLeft className="w-5 h-5 transition-transform group-hover:-translate-x-1" />
          Back to Chat
        </button>

        <div className="glass-card overflow-hidden">
          {/* Header Background */}
          <div className="h-32 bg-gradient-to-br from-primary-start/20 via-primary-end/20 to-transparent relative border-b border-white/5" />
          
          <div className="px-8 pb-10">
            {/* Profile Avatar Section */}
            <div className="-translate-y-16 flex flex-col md:flex-row gap-8 items-center md:items-end mb-4">
              <AvatarUpload />
            </div>

            {/* Profile Settings Section */}
            <div className="-mt-12">
              <ProfileSettings />
            </div>
          </div>
        </div>

        {/* Branding Footer */}
        <div className="mt-8 text-center">
          <p className="text-text-muted text-xs uppercase tracking-[0.2em] font-medium opacity-50">
            Real-time Chat POC • Radius Aesthetic
          </p>
        </div>
      </div>
    </div>
  );
}
