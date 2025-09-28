import {
  LoginData,
  RegisterData,
  ActivationData,
  ApiResponse,
  AuthResponse,
  User,
  PasswordResetData,
  PasswordResetConfirmData,
  UserUpdateData,
} from "@/types";
import { API_URL } from "@/utils/env";

class ApiClient {
  private async request<T>(
    endpoint: string,
    method: string = "GET",
    data?: any,
    token?: string
  ): Promise<ApiResponse<T>> {
    const url = `${API_URL}${endpoint}`;
    const headers: HeadersInit = {
      "Content-Type": "application/json",
    };

    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    try {
      const response = await fetch(url, {
        method,
        headers,
        body: data ? JSON.stringify(data) : undefined,
      });

      const responseData = await response.json();

      if (!response.ok) {
        return {
          error: responseData.detail || "Something went wrong",
        };
      }

      return { data: responseData };
    } catch (error) {
      return {
        error: "Network error occurred. Please try again.",
      };
    }
  }

  async login(data: LoginData): Promise<ApiResponse<AuthResponse>> {
    const formData = new FormData();
    formData.append("username", data.email);
    formData.append("password", data.password);

    try {
      const response = await fetch(`${API_URL}/auth/token`, {
        method: "POST",
        body: formData,
      });

      const responseData = await response.json();

      if (!response.ok) {
        return {
          error: responseData.detail || "Invalid credentials",
        };
      }

      return { data: responseData };
    } catch (error) {
      return {
        error: "Network error occurred. Please try again.",
      };
    }
  }

  async register(data: RegisterData): Promise<ApiResponse<User>> {
    return this.request<User>("/auth/register", "POST", {
      email: data.email,
      password: data.password,
    });
  }

  async activate(
    data: ActivationData
  ): Promise<ApiResponse<{ message: string }>> {
    return this.request<{ message: string }>("/auth/activate", "POST", data);
  }

  async getCurrentUser(token: string): Promise<ApiResponse<User>> {
    return this.request<User>("/auth/me", "GET", undefined, token);
  }

  async forgotPassword(
    data: PasswordResetData
  ): Promise<ApiResponse<{ message: string }>> {
    return this.request<{ message: string }>(
      "/auth/forgot-password",
      "POST",
      data
    );
  }

  async resetPassword(
    data: PasswordResetConfirmData
  ): Promise<ApiResponse<{ message: string }>> {
    return this.request<{ message: string }>(
      "/auth/reset-password",
      "POST",
      data
    );
  }

  async updateAccount(
    data: UserUpdateData,
    token: string
  ): Promise<ApiResponse<User>> {
    return this.request<User>("/auth/update-account", "PUT", data, token);
  }
}

export const api = new ApiClient();
