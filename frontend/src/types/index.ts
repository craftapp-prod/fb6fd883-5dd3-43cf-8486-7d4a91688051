export interface User {
  id: number;
  email: string;
  is_active: boolean;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

export interface LoginData {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  confirmPassword: string;
}

export interface ActivationData {
  email: string;
  activation_code: string;
}

export interface PasswordResetData {
  email: string;
}

export interface PasswordResetConfirmData {
  email: string;
  reset_code: string;
  new_password: string;
}

export interface UserUpdateData {
  email?: string;
  password?: string;
}

export interface ApiResponse<T> {
  data?: T;
  error?: string;
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
}
