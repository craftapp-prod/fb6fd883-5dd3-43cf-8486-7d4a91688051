"use client";

import React, {
  useState,
  useEffect,
  createContext,
  useContext,
  ReactNode,
} from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { getToken, setToken, removeToken } from "@/lib/utils";
import {
  AuthState,
  LoginData,
  RegisterData,
  ActivationData,
  User,
  UserUpdateData,
} from "@/types";

interface AuthContextType extends AuthState {
  login: (data: LoginData) => Promise<boolean>;
  register: (data: RegisterData) => Promise<boolean>;
  activate: (data: ActivationData) => Promise<boolean>;
  updateAccount: (data: UserUpdateData) => Promise<boolean>;
  logout: () => void;
}

const defaultAuthState: AuthState = {
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: true,
  error: null,
};

const AuthContext = createContext<AuthContextType>({
  ...defaultAuthState,
  login: async () => false,
  register: async () => false,
  activate: async () => false,
  updateAccount: async () => false,
  logout: () => {},
});

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [state, setState] = useState<AuthState>(defaultAuthState);
  const router = useRouter();

  useEffect(() => {
    const initializeAuth = async () => {
      const token = getToken();

      if (token) {
        try {
          const response = await api.getCurrentUser(token);

          if (response.data) {
            setState({
              user: response.data,
              token,
              isAuthenticated: true,
              isLoading: false,
              error: null,
            });
          } else {
            removeToken();
            setState({
              ...defaultAuthState,
              isLoading: false,
            });
          }
        } catch (error) {
          removeToken();
          setState({
            ...defaultAuthState,
            isLoading: false,
          });
        }
      } else {
        setState({
          ...defaultAuthState,
          isLoading: false,
        });
      }
    };

    initializeAuth();
  }, []);

  const login = async (data: LoginData): Promise<boolean> => {
    setState((prev) => ({ ...prev, isLoading: true, error: null }));

    const response = await api.login(data);

    if (response.data) {
      const { access_token } = response.data;
      setToken(access_token);

      const userResponse = await api.getCurrentUser(access_token);

      if (userResponse.data) {
        setState({
          user: userResponse.data,
          token: access_token,
          isAuthenticated: true,
          isLoading: false,
          error: null,
        });
        return true;
      } else {
        setState({
          ...defaultAuthState,
          isLoading: false,
          error: userResponse.error || "Failed to fetch user data",
        });
        return false;
      }
    } else {
      setState({
        ...defaultAuthState,
        isLoading: false,
        error: response.error || "Login failed",
      });
      return false;
    }
  };

  const register = async (data: RegisterData): Promise<boolean> => {
    setState((prev) => ({ ...prev, isLoading: true, error: null }));

    const response = await api.register(data);

    if (response.data) {
      setState({
        ...defaultAuthState,
        isLoading: false,
      });
      return true;
    } else {
      setState({
        ...defaultAuthState,
        isLoading: false,
        error: response.error || "Registration failed",
      });
      return false;
    }
  };

  const activate = async (data: ActivationData): Promise<boolean> => {
    setState((prev) => ({ ...prev, isLoading: true, error: null }));

    const response = await api.activate(data);

    if (response.data) {
      setState({
        ...defaultAuthState,
        isLoading: false,
      });
      return true;
    } else {
      setState({
        ...defaultAuthState,
        isLoading: false,
        error: response.error || "Account activation failed",
      });
      return false;
    }
  };

  const updateAccount = async (data: UserUpdateData): Promise<boolean> => {
    setState((prev) => ({ ...prev, isLoading: true, error: null }));

    if (!state.token) {
      setState((prev) => ({
        ...prev,
        isLoading: false,
        error: "You must be logged in to update your account",
      }));
      return false;
    }

    const response = await api.updateAccount(data, state.token);

    if (response.data) {
      setState((prev) => ({
        ...prev,
        user: response.data as User,
        isLoading: false,
        error: null,
        token: prev.token,
        isAuthenticated: prev.isAuthenticated,
      }));
      return true;
    } else {
      setState((prev) => ({
        ...prev,
        isLoading: false,
        error: response.error || "Failed to update account",
      }));
      return false;
    }
  };

  const logout = () => {
    removeToken();
    setState({
      ...defaultAuthState,
      isLoading: false,
    });
    router.push("/");
  };

  const value = {
    ...state,
    login,
    register,
    activate,
    updateAccount,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => useContext(AuthContext);

export default useAuth;
