import { useState, useRef } from 'react';
import { useAuthStore } from '../../store/authStore';
import { api } from '../../services/api';
import { Upload, Trash2, Camera, User as UserIcon, AlertCircle } from 'lucide-react';

export function AvatarUpload() {
  const { user, updateUser } = useAuthStore();
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setError(null);

    // Client-side size check (1MB)
    if (file.size > 1 * 1024 * 1024) {
      setError('File is too large. Max size is 1MB.');
      return;
    }

    const formData = new FormData();
    formData.append('avatar', file);

    setIsUploading(true);
    try {
      const res = await api.post('/profile/me/avatar', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      updateUser({ 
        avatarBase64: res.data.avatarBase64, 
        avatarMimeType: res.data.avatarMimeType 
      });
    } catch (err: any) {
      console.error('Failed to upload avatar', err);
      setError(err.response?.data?.error?.message || 'Failed to upload avatar. Please try again.');
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to remove your avatar?')) return;

    try {
      await api.delete('/profile/me/avatar');
      updateUser({ avatarBase64: undefined, avatarMimeType: undefined });
    } catch (err) {
      console.error('Failed to delete avatar', err);
      alert('Failed to delete avatar.');
    }
  };

  const avatarUrl = user?.avatarBase64 
    ? `data:${user.avatarMimeType};base64,${user.avatarBase64}` 
    : null;

  return (
    <div className="flex flex-col items-center gap-6">
      <div className="relative group">
        <div className="w-32 h-32 rounded-3xl overflow-hidden bg-white/5 border-2 border-white/10 flex items-center justify-center transition-all group-hover:border-primary-start/50">
          {avatarUrl ? (
            <img 
              src={avatarUrl} 
              alt={user?.displayName} 
              className="w-full h-full object-cover"
            />
          ) : (
            <UserIcon className="w-12 h-12 text-text-muted" />
          )}
          
          {isUploading && (
            <div className="absolute inset-0 bg-black/60 flex items-center justify-center backdrop-blur-sm">
              <div className="w-8 h-8 border-2 border-primary-start border-t-transparent rounded-full animate-spin" />
            </div>
          )}
        </div>
        
        <button 
          onClick={() => fileInputRef.current?.click()}
          disabled={isUploading}
          className="absolute -bottom-2 -right-2 w-10 h-10 bg-primary-start text-white rounded-xl flex items-center justify-center shadow-lg hover:scale-110 active:scale-95 transition-all disabled:opacity-50"
        >
          <Camera className="w-5 h-5" />
        </button>
      </div>

      <div className="flex gap-3">
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          accept="image/jpeg,image/png,image/webp"
          className="hidden"
        />
        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={isUploading}
          className="px-4 py-2 bg-white/5 hover:bg-white/10 text-white rounded-xl text-sm font-medium flex items-center gap-2 transition-all"
        >
          <Upload className="w-4 h-4" />
          Change Photo
        </button>
        
        {avatarUrl && (
          <button
            onClick={handleDelete}
            disabled={isUploading}
            className="px-4 py-2 bg-error/10 hover:bg-error/20 text-error rounded-xl text-sm font-medium flex items-center gap-2 transition-all"
          >
            <Trash2 className="w-4 h-4" />
            Remove
          </button>
        )}
      </div>

      {error && (
        <div className="flex items-center gap-2 text-error text-xs bg-error/10 border border-error/20 px-3 py-2 rounded-lg animate-fade-in">
          <AlertCircle className="w-3.5 h-3.5" />
          {error}
        </div>
      )}

      <p className="text-[10px] text-text-muted uppercase tracking-wider">JPG, PNG or WebP • Max 1MB</p>
    </div>
  );
}
