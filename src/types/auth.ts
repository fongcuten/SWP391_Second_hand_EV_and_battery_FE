export type UserStatus =
  | "ACTIVE"
  | "BANNED"
  | "PENDING"
  | "SUSPENDED"
  | "DEACTIVATED"
  | "INACTIVE"
  | string;

export interface User {
  id: string;
  email: string;
  fullName: string;
  phoneNumber?: string;
  avatarUrl?: string; // Main avatar URL
  avatarThumbUrl?: string; // Thumbnail URL
  role: "user" | "admin";
  status: UserStatus;
  createdAt: string;
  isEmailVerified: boolean;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

export interface LoginRequest {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface RegisterRequest {
  email: string;
  password: string;
  confirmPassword: string;
  fullName: string;
  phoneNumber?: string;
}

export interface AuthResponse {
  user: User;
  token: string | null;
  refreshToken?: string;
}

export interface LoginFormData {
  username: string;
  password: string;
  rememberMe: boolean;
}

export interface RegisterFormData {
  email: string;
  password: string;
  confirmPassword: string;
  fullName: string;
  phoneNumber: string;
  agreeToTerms: boolean;
}
