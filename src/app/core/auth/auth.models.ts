export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  user: CurrentUser;
  studioId: string;
  studioName: string;
  role: string;
  permissions: string[];
}

export interface RefreshTokenResponse {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

export interface CurrentStudio {
  id: string;
  name: string;
}

export interface CurrentUser {
  id: string;
  name: string;
  email: string;
  role: string;
  studio: CurrentStudio;
  permissions: string[];
}
