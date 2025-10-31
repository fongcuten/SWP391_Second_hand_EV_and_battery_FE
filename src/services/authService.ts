import type {
  User,
  LoginRequest,
  RegisterRequest,
  AuthResponse,
} from "../types/auth";

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
    const response = await fetch(
      "http://localhost:8080/evplatform/auth/token",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: loginData.email,
          password: loginData.password,
        }),
      }
    );

    const data = await response.json();

    if (data.code !== 1000) {
      throw new Error(data.message || "Đăng nhập thất bại");
    }

    const token = data.result?.token;
    console.log("Received token:", token);
    if (!token) throw new Error("No token received from server");

    // Try to derive role from JWT if backend doesn't return role field
    const deriveRoleFromToken = (jwt: string): User["role"] | null => {
      try {
        const parts = jwt.split(".");
        if (parts.length !== 3) return null;
        const base64 = parts[1].replace(/-/g, "+").replace(/_/g, "/");
        const json = atob(base64);
        const payload = JSON.parse(json);
        const rawRole =
          payload?.role ??
          (Array.isArray(payload?.roles) ? payload.roles[0] : null) ??
          (Array.isArray(payload?.authorities)
            ? payload.authorities[0]
            : null) ??
          payload?.authority ??
          payload?.scope ?? // lấy từ scope nếu có
          null;
        if (!rawRole) return null;
        const normalized = String(rawRole).trim().toLowerCase();
        if (normalized.includes("admin")) return "admin";
        if (normalized.includes("user")) return "user";
        return null;
      } catch {
        return null;
      }
    };

    const backendRole = data.result?.role as string | undefined;
    const tokenRole = deriveRoleFromToken(token);

    const finalRole = (
      backendRole
        ? String(backendRole).trim().toLowerCase()
        : tokenRole || "user"
    ) as User["role"];

    const user: User = {
      id: data.result?.userId || "1",
      email: loginData.email,
      fullName: data.result?.fullName || loginData.email,
      phoneNumber: data.result?.phoneNumber || "",
      role: finalRole,
      createdAt: new Date().toISOString(),
      isEmailVerified: true,
    };

    localStorage.setItem(AUTH_TOKEN_KEY, token); // store backend JWT
    localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));

    return { user, token };
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

    // For register, we **don’t generate fake token**, user must login to get real token
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
      const normalizedRole = (parsed.role as string | undefined)
        ? String(parsed.role).trim()
        : "user";
      const normalizedUser: User = {
        id: String(parsed.id || ""),
        email: String(parsed.email || ""),
        fullName: String(parsed.fullName || parsed.email || ""),
        phoneNumber: parsed.phoneNumber,
        avatar: parsed.avatar,
        role: normalizedRole, // giữ nguyên role
        createdAt: String(parsed.createdAt || new Date().toISOString()),
        isEmailVerified: Boolean(parsed.isEmailVerified),
      };
      // Persist normalized shape
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
