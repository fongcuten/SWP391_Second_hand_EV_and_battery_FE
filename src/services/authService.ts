import type {
  User,
  LoginRequest,
  RegisterRequest,
  AuthResponse,
} from "../types/auth";
import api from "../config/axios";

const CURRENT_USER_KEY = "current_user";
const AUTH_TOKEN_KEY = "auth_token";

// Mock users for frontend UI purposes only
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
        createdAt: new Date().toISOString(),
        isEmailVerified: true,
      },
      {
        id: "2",
        email: "user@example.com",
        fullName: "Test User",
        phoneNumber: "0987654321",
        role: "user",
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
            `${backendUser.firstName || ""} ${backendUser.lastName || ""}`.trim() ||
            backendUser.username ||
            loginData.email,
          phoneNumber: backendUser.phone || "",
          role: deriveRoleFromToken(token),
          createdAt: backendUser.createdAt || new Date().toISOString(),
          isEmailVerified: true,
        };

        console.log("✅ Final user object:", user);
        localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));

        return { user, token };
      } else {
        throw new Error("Invalid user info response");
      }
    } catch (error) {
      console.error("❌ Error fetching user info:", error);

      // ⚠️ Fallback: create minimal user (should rarely happen)
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
        id: loginData.email,
        email: loginData.email,
        fullName: loginData.email,
        phoneNumber: "",
        role: deriveRoleFromToken(token),
        createdAt: new Date().toISOString(),
        isEmailVerified: true,
      };

      console.warn("⚠️ Using fallback user:", user);
      localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));

      return { user, token };
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
      createdAt: new Date().toISOString(),
      isEmailVerified: false,
    };

    users.push(newUser);
    localStorage.setItem(MOCK_USERS_KEY, JSON.stringify(users));

    return { user: newUser, token: null };
  },

  logout: async () => {
    localStorage.removeItem(AUTH_TOKEN_KEY);
    localStorage.removeItem(CURRENT_USER_KEY);
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
      const normalizedUser: User = {
        id: String(parsed.id || ""),
        email: String(parsed.email || ""),
        fullName: String(parsed.fullName || parsed.email || ""),
        phoneNumber: parsed.phoneNumber,
        avatar: parsed.avatar,
        role: normalizedRole,
        createdAt: String(parsed.createdAt || new Date().toISOString()),
        isEmailVerified: Boolean(parsed.isEmailVerified),
      };
      localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(normalizedUser));
      return normalizedUser;
    } catch {
      return null;
    }
  },

  isAuthenticated: (): boolean => {
    return (
      !!localStorage.getItem(AUTH_TOKEN_KEY) &&
      !!localStorage.getItem(CURRENT_USER_KEY)
    );
  },

  getToken: (): string | null => {
    return localStorage.getItem(AUTH_TOKEN_KEY);
  },
};

initializeMockUsers();
