export interface AuthResponse {
  accessToken: string;
  expiresAtUtc: string;
  userId: string;
  email: string;
  roles: string[];
}

export interface MeResponse {
  userId: string;
  email: string;
  roles: string[];
}
