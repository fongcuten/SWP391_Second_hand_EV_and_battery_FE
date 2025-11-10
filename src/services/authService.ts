import type {
  User,
  UserStatus,
  LoginRequest,
  RegisterRequest,
  AuthResponse,
} from "../types/auth";
import api from "../config/axios";

const CURRENT_USER_KEY = "current_user";
const AUTH_TOKEN_KEY = "auth_token";

const clearSession = () => {
  localStorage.removeItem(AUTH_TOKEN_KEY);
  localStorage.removeItem(CURRENT_USER_KEY);
};

const normalizeStatus = (status: unknown): UserStatus => {
  if (typeof status !== "string") return "ACTIVE";
  const normalized = status.trim().toUpperCase();
  if (!normalized) return "ACTIVE";
  switch (normalized) {
    case "ACTIVE":
    case "BANNED":
    case "PENDING":
    case "SUSPENDED":
    case "DEACTIVATED":
    case "INACTIVE":
      return normalized;
    default:
      return normalized;
  }
};

// Mock users for frontend UI purposes
const MOCK_USERS_KEY = "mock_users";

const initializeMockUsers = () => {
  const existingUsers = localStorage.getItem(MOCK_USERS_KEY);
  if (!existingUsers) {
    const defaultUsers: User[] = [
      {
        id: "1",
        email: "admin@example.com",
        fullName: "Admin User",
        phoneNumber: "0123456789",
        role: "admin",
        status: "ACTIVE",
        createdAt: new Date().toISOString(),
        isEmailVerified: true,
      },
      {
        id: "2",
        email: "user@example.com",
        fullName: "Test User",
        phoneNumber: "0987654321",
        role: "user",
        status: "ACTIVE",
        createdAt: new Date().toISOString(),
        isEmailVerified: true,
      },
    ];
    localStorage.setItem(MOCK_USERS_KEY, JSON.stringify(defaultUsers));
  }
};

const getMockUsers = (): User[] => {
  initializeMockUsers();
  const users = localStorage.getItem(MOCK_USERS_KEY);
  return users ? JSON.parse(users) : [];
};

export const authService = {
  // Login with backend
  login: async (loginData: LoginRequest): Promise<AuthResponse> => {
    console.log("🔐 Login attempt:", { username: loginData.email });

    // 1. Get token from backend
    const response = await fetch(
      "http://localhost:8080/evplatform/auth/token",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: loginData.email, // Actually username, not email
          password: loginData.password,
        }),
      }
    );

    const data = await response.json();
    console.log("📡 Backend /auth/token response:", data);

    if (data.code !== 1000) {
      throw new Error(data.message || "Đăng nhập thất bại");
    }

    const token = data.result?.token;
    if (!token) throw new Error("No token received from server");

    console.log("✅ Token received:", token.substring(0, 20) + "...");

    // ✅ 2. Save token FIRST (so axios can use it in interceptor)
    localStorage.setItem(AUTH_TOKEN_KEY, token);
    console.log("💾 Token saved to localStorage");

    // ✅ 3. Fetch REAL user info from backend
    try {
      console.log("📥 Fetching user info from /users/myInfo...");

      const userResponse = await api.get("/users/myInfo");
      console.log("✅ User info response:", userResponse.data);

      if (userResponse.data?.code === 1000 && userResponse.data?.result) {
        const backendUser = userResponse.data.result;
        const normalizedStatus = normalizeStatus(backendUser.status);

        if (normalizedStatus === "BANNED") {
          clearSession();
          throw new Error(
            "Tài khoản của bạn đã bị cấm. Vui lòng liên hệ hỗ trợ để biết thêm chi tiết."
          );
        }

        // Derive role from token
        const deriveRoleFromToken = (jwt: string): User["role"] => {
          try {
            const parts = jwt.split(".");
            if (parts.length !== 3) return "user";
            const base64 = parts[1].replace(/-/g, "+").replace(/_/g, "/");
            const json = atob(base64);
            const payload = JSON.parse(json);
            const rawRole =
              payload?.role ??
              payload?.scope ??
              (Array.isArray(payload?.roles) ? payload.roles[0] : null) ??
              null;
            if (!rawRole) return "user";
            const normalized = String(rawRole).trim().toLowerCase();
            return normalized.includes("admin") ? "admin" : "user";
          } catch {
            return "user";
          }
        };

        // ✅ Create user from BACKEND data
        const user: User = {
          id: String(backendUser.userId),
          email: backendUser.email || loginData.email,
          fullName:
            `${backendUser.firstName || ""} ${
              backendUser.lastName || ""
            }`.trim() ||
            backendUser.username ||
            loginData.email,
          phoneNumber: backendUser.phone || "",
          role: deriveRoleFromToken(token),
          status: normalizedStatus,
          createdAt: backendUser.createdAt || new Date().toISOString(),
          isEmailVerified: true,
          avatarUrl: backendUser.avatarUrl || undefined,
          avatarThumbUrl: backendUser.avatarThumbUrl || undefined,
        };

        console.log("✅ Final user object:", user);
        localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));

        return { user, token };
      } else {
        throw new Error("Invalid user info response");
      }
    } catch (error: any) {
      console.error("❌ Error fetching user info:", error);
      clearSession();
      const message =
        error?.response?.data?.message ||
        error?.message ||
        "Đăng nhập thất bại. Vui lòng thử lại.";
      throw new Error(message);
    }
  },

  // Register (mock users only)
  register: async (registerData: RegisterRequest): Promise<AuthResponse> => {
    const users = getMockUsers();
    if (users.find((u) => u.email === registerData.email)) {
      throw new Error("Email đã được sử dụng");
    }

    const newUser: User = {
      id: Date.now().toString(),
      email: registerData.email,
      fullName: registerData.fullName,
      phoneNumber: registerData.phoneNumber,
      role: "user",
      status: "ACTIVE",
      createdAt: new Date().toISOString(),
      isEmailVerified: false,
    };

    users.push(newUser);
    localStorage.setItem(MOCK_USERS_KEY, JSON.stringify(users));

    return { user: newUser, token: null };
  },

  logout: async () => {
    clearSession();
  },

  getCurrentUser: (): User | null => {
    const userStr = localStorage.getItem(CURRENT_USER_KEY);
    if (!userStr) return null;
    try {
      const parsed = JSON.parse(userStr) as Partial<User>;
      if (!parsed) return null;
      const normalizedRoleStr = (parsed.role as string | undefined)
        ? String(parsed.role).trim().toLowerCase()
        : "user";
      const normalizedRole = (
        normalizedRoleStr === "admin" ? "admin" : "user"
      ) as User["role"];
      const status = normalizeStatus(
        (parsed as Record<string, unknown>).status
      );
      if (status === "BANNED") {
        clearSession();
        return null;
      }

      const normalizedUser: User = {
        id: String(parsed.id || ""),
        email: String(parsed.email || ""),
        fullName: String(parsed.fullName || parsed.email || ""),
        phoneNumber: parsed.phoneNumber,
        avatarUrl: parsed.avatarUrl, // Correctly read avatarUrl
        avatarThumbUrl: parsed.avatarThumbUrl, // Correctly read avatarThumbUrl
        role: normalizedRole,
        status,
        createdAt: String(parsed.createdAt || new Date().toISOString()),
        isEmailVerified: Boolean(parsed.isEmailVerified),
      };

      localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(normalizedUser));
      return normalizedUser;
    } catch {
      return null;
    }
  },

  refreshCurrentUser: async (): Promise<User> => {
    const token = localStorage.getItem(AUTH_TOKEN_KEY);
    if (!token) {
      clearSession();
      throw new Error("Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.");
    }

    try {
      const response = await api.get("/users/myInfo");
      if (response.data?.code !== 1000 || !response.data?.result) {
        clearSession();
        throw new Error("Không thể tải thông tin người dùng.");
      }

      const backendUser = response.data.result;
      const normalizedStatus = normalizeStatus(backendUser.status);
      if (normalizedStatus === "BANNED") {
        clearSession();
        throw new Error(
          "Tài khoản của bạn đã bị cấm. Vui lòng liên hệ hỗ trợ để biết thêm chi tiết."
        );
      }

      const deriveRoleFromToken = (jwt: string): User["role"] => {
        try {
          const parts = jwt.split(".");
          if (parts.length !== 3) return "user";
          const base64 = parts[1].replace(/-/g, "+").replace(/_/g, "/");
          const json = atob(base64);
          const payload = JSON.parse(json);
          const rawRole =
            payload?.role ??
            payload?.scope ??
            (Array.isArray(payload?.roles) ? payload.roles[0] : null) ??
            null;
          if (!rawRole) return "user";
          const normalized = String(rawRole).trim().toLowerCase();
          return normalized.includes("admin") ? "admin" : "user";
        } catch {
          return "user";
        }
      };

      const user: User = {
        id: String(backendUser.userId ?? backendUser.id ?? ""),
        email: backendUser.email || backendUser.username || "",
        fullName:
          `${backendUser.firstName || ""} ${
            backendUser.lastName || ""
          }`.trim() ||
          backendUser.username ||
          backendUser.email ||
          "",
        phoneNumber: backendUser.phone || "",
        role: deriveRoleFromToken(token),
        status: normalizedStatus,
        createdAt: backendUser.createdAt || new Date().toISOString(),
        isEmailVerified: true,
        avatarUrl: backendUser.avatarUrl || undefined,
        avatarThumbUrl: backendUser.avatarThumbUrl || undefined,
      };

      localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
      return user;
    } catch (error: any) {
      clearSession();
      const message =
        error?.response?.data?.message ||
        error?.message ||
        "Không thể tải thông tin người dùng.";
      throw new Error(message);
    }
  },

  isAuthenticated: (): boolean => {
    const token = localStorage.getItem(AUTH_TOKEN_KEY);
    if (!token) return false;

    const userStr = localStorage.getItem(CURRENT_USER_KEY);
    if (!userStr) return false;
    try {
      const parsed = JSON.parse(userStr) as Partial<User>;
      const status = normalizeStatus(parsed?.status);
      if (status === "BANNED") {
        clearSession();
        return false;
      }
      return true;
    } catch {
      clearSession();
      return false;
    }
  },

  getToken: (): string | null => {
    return localStorage.getItem(AUTH_TOKEN_KEY);
  },
};

initializeMockUsers();
