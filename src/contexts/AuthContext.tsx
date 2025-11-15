import React, {
  createContext,
  useContext,
  useReducer,
  useEffect,
  useCallback,
  type ReactNode,
} from "react";
import type {
  User,
  AuthState,
  LoginRequest,
  RegisterRequest,
} from "../types/auth";
import { authService } from "../services/authService";

// Actions
type AuthAction =
  | { type: "AUTH_START" }
  | { type: "AUTH_SUCCESS"; payload: User }
  | { type: "AUTH_FAILURE"; payload: string }
  | { type: "LOGOUT" }
  | { type: "UPDATE_USER"; payload: User }
  | { type: "CLEAR_ERROR" };

// Initial state
const initialState: AuthState = {
  user: null,
  isAuthenticated: false,
  isLoading: true,
  error: null,
};

// Reducer
const authReducer = (state: AuthState, action: AuthAction): AuthState => {
  switch (action.type) {
    case "AUTH_START":
      return {
        ...state,
        isLoading: true,
        error: null,
      };
    case "AUTH_SUCCESS":
      return {
        ...state,
        user: action.payload,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      };
    case "AUTH_FAILURE":
      return {
        ...state,
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: action.payload,
      };
    case "LOGOUT":
      return {
        ...state,
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
      };
    case "UPDATE_USER":
      return {
        ...state,
        user: action.payload,
      };
    case "CLEAR_ERROR":
      return {
        ...state,
        error: null,
      };
    default:
      return state;
  }
};

// Context type
interface AuthContextType extends AuthState {
  login: (loginData: LoginRequest) => Promise<void>;
  register: (registerData: RegisterRequest) => Promise<void>;
  logout: () => Promise<void>;
  updateProfile: (userData: Partial<User>) => Promise<void>;
  changePassword: (oldPassword: string, newPassword: string) => Promise<void>;
  forgotPassword: (email: string) => Promise<void>;
  verifyEmail: (token: string) => Promise<void>;
  clearError: () => void;
}

// Create context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Provider component
interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Check if user is already logged in on app start
  useEffect(() => {
    let mounted = true;

    const initializeAuth = async () => {
      if (!authService.isAuthenticated()) {
        if (mounted) {
          dispatch({ type: "AUTH_FAILURE", payload: "Not authenticated" });
        }
        return;
      }

      try {
        const user = await authService.refreshCurrentUser();
        if (mounted) {
          dispatch({ type: "AUTH_SUCCESS", payload: user });
        }
      } catch (error: any) {
        const message =
          error instanceof Error ? error.message : "Authentication error";
        if (mounted) {
          dispatch({ type: "AUTH_FAILURE", payload: message });
        }
      }
    };

    void initializeAuth();

    return () => {
      mounted = false;
    };
  }, []);

  // Login function
  const login = async (loginData: LoginRequest): Promise<void> => {
    dispatch({ type: "AUTH_START" });
    try {
      const response = await authService.login(loginData);
      dispatch({ type: "AUTH_SUCCESS", payload: response.user });
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Đăng nhập thất bại";
      dispatch({ type: "AUTH_FAILURE", payload: errorMessage });
      throw error;
    }
  };

  // Register function
  const register = async (registerData: RegisterRequest): Promise<void> => {
    dispatch({ type: "AUTH_START" });
    try {
      const response = await authService.register(registerData);
      dispatch({ type: "AUTH_SUCCESS", payload: response.user });
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Đăng ký thất bại";
      dispatch({ type: "AUTH_FAILURE", payload: errorMessage });
      throw error;
    }
  };

  // Logout function
  const logout = async (): Promise<void> => {
    try {
      await authService.logout();
      dispatch({ type: "LOGOUT" });
    } catch (error) {
      // Even if logout fails, clear local state
      dispatch({ type: "LOGOUT" });
    }
  };

  // Update profile function
  const updateProfile = async (userData: Partial<User>): Promise<void> => {
    try {
      const updatedUser = await authService.updateProfile(userData);
      dispatch({ type: "UPDATE_USER", payload: updatedUser });
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Cập nhật thông tin thất bại";
      dispatch({ type: "AUTH_FAILURE", payload: errorMessage });
      throw error;
    }
  };

  // Change password function
  const changePassword = async (
    oldPassword: string,
    newPassword: string
  ): Promise<void> => {
    try {
      await authService.changePassword(oldPassword, newPassword);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Đổi mật khẩu thất bại";
      dispatch({ type: "AUTH_FAILURE", payload: errorMessage });
      throw error;
    }
  };

  // Forgot password function
  const forgotPassword = async (email: string): Promise<void> => {
    try {
      await authService.forgotPassword(email);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Gửi email thất bại";
      dispatch({ type: "AUTH_FAILURE", payload: errorMessage });
      throw error;
    }
  };

  // Verify email function
  const verifyEmail = async (token: string): Promise<void> => {
    try {
      await authService.verifyEmail(token);
      const user = authService.getCurrentUser();
      if (user) {
        dispatch({ type: "UPDATE_USER", payload: user });
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Xác thực email thất bại";
      dispatch({ type: "AUTH_FAILURE", payload: errorMessage });
      throw error;
    }
  };

  // Clear error function
  const clearError = useCallback((): void => {
    dispatch({ type: "CLEAR_ERROR" });
  }, []);

  const value: AuthContextType = {
    ...state,
    login,
    register,
    logout,
    updateProfile,
    changePassword,
    forgotPassword,
    verifyEmail,
    clearError,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Custom hook to use auth context
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
