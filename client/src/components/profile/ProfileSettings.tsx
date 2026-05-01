import { useState } from 'react';
import { useAuthStore } from '../../store/authStore';
import { api } from '../../services/api';
import { Save, User as UserIcon, FileText, CheckCircle, AlertCircle } from 'lucide-react';
import { cn } from '../../utils/cn';

export function ProfileSettings() {
  const { user, updateUser } = useAuthStore();
  const [displayName, setDisplayName] = useState(user?.displayName || '');
  const [bio, setBio] = useState(user?.bio || '');
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setMessage(null);

    try {
      const res = await api.patch('/profile/me', { displayName, bio });
      updateUser({ displayName: res.data.displayName, bio: res.data.bio });
      setMessage({ type: 'success', text: 'Profile updated successfully!' });
    } catch (err: any) {
      console.error('Failed to update profile', err);
      setMessage({ type: 'error', text: err.response?.data?.error?.message || 'Failed to update profile' });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-xl font-bold text-white mb-1">Account Details</h3>
        <p className="text-text-muted text-sm">Update your public information</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <label className="text-sm font-medium text-text-muted flex items-center gap-2">
            <UserIcon className="w-4 h-4" />
            Display Name
          </label>
          <input
            type="text"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            placeholder="Your name"
            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-text-muted focus:border-primary-start outline-none transition-all"
            maxLength={50}
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-text-muted flex items-center gap-2">
            <FileText className="w-4 h-4" />
            Bio
          </label>
          <textarea
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            placeholder="Tell us about yourself..."
            rows={4}
            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-text-muted focus:border-primary-start outline-none transition-all resize-none"
            maxLength={160}
          />
          <div className="text-right text-[10px] text-text-muted">
            {bio.length}/160
          </div>
        </div>

        {message && (
          <div className={cn(
            "p-3 rounded-xl flex items-center gap-3 text-sm animate-fade-in",
            message.type === 'success' ? "bg-success/10 text-success border border-success/20" : "bg-error/10 text-error border border-error/20"
          )}>
            {message.type === 'success' ? <CheckCircle className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
            {message.text}
          </div>
        )}

        <button
          type="submit"
          disabled={isSaving || (displayName === user?.displayName && bio === user?.bio)}
          className="w-full h-12 rounded-xl bg-gradient-primary text-white font-bold flex items-center justify-center gap-2 disabled:opacity-50 transition-all hover:shadow-lg hover:shadow-primary-start/20 active:scale-[0.98]"
        >
          {isSaving ? (
            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            <>
              <Save className="w-5 h-5" />
              Save Changes
            </>
          )}
        </button>
      </form>
    </div>
  );
}
