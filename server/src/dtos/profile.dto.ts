// Profile DTOs

export interface ProfileResponse {
  userId: string;
  username: string;
  displayName: string;
  bio: string;
  avatarBase64?: string;
  avatarMimeType?: string;
  createdAt: string;
  updatedAt: string;
}

export interface PublicProfileResponse {
  userId: string;
  username: string;
  displayName: string;
  bio: string;
  avatarBase64?: string;
  avatarMimeType?: string;
}

export interface UpdateProfileRequest {
  displayName?: string;
  bio?: string;
}
