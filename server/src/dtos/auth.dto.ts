// Auth DTOs

export interface RegisterRequest {
  username: string;
  password: string;
  displayName?: string;
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  user: UserSummary;
}

export interface UserSummary {
  userId: string;
  username: string;
  displayName: string;
}

export interface JwtPayload {
  userId: string;
  username: string;
  displayName: string;
  iat?: number;
  exp?: number;
}
