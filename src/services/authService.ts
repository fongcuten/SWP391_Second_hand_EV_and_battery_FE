import type {
  User,
  LoginRequest,
  RegisterRequest,
  AuthResponse,
} from "../types/auth";

// Mock users database (trong thực tế sẽ là API call)
const MOCK_USERS_KEY = "mock_users";
const CURRENT_USER_KEY = "current_user";
const AUTH_TOKEN_KEY = "auth_token";

// Khởi tạo mock users nếu chưa có
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

// Utility functions
const getMockUsers = (): User[] => {
  initializeMockUsers();
  const users = localStorage.getItem(MOCK_USERS_KEY);
  return users ? JSON.parse(users) : [];
};

const saveMockUsers = (users: User[]) => {
  localStorage.setItem(MOCK_USERS_KEY, JSON.stringify(users));
};

const generateId = (): string => {
  return Date.now().toString() + Math.random().toString(36).substr(2, 9);
};

const generateToken = (): string => {
  return (
    "mock_token_" +
    Date.now().toString() +
    Math.random().toString(36).substr(2, 9)
  );
};

// Simulate API delay
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export const authService = {
  // Đăng nhập
  login: async (loginData: LoginRequest): Promise<AuthResponse> => {
    try {
      const response = await fetch(
        "http://localhost:8080/evplatform/auth/token",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            username: loginData.email, // API sử dụng username field
            password: loginData.password,
          }),
        }
      );

      const data = await response.json();
      console.log("Login response:", data);

      if (data.code !== 1000) {
        throw new Error(data.message || "Đăng nhập thất bại");
      }

      // Tạo user object từ response
      const user: User = {
        id: data.result?.userId || "1",
        email: loginData.email,
        fullName: data.result?.fullName || loginData.email,
        phoneNumber: data.result?.phoneNumber || "",
        role: data.result?.role || "user",
        createdAt: new Date().toISOString(),
        isEmailVerified: true,
      };

      const token = data.result?.token;

      // Lưu thông tin đăng nhập
      localStorage.setItem(AUTH_TOKEN_KEY, token);
      localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));

      return {
        user,
        token,
      };
    } catch (error) {
      console.error("Login error:", error);
      throw error;
    }
  },

  // Đăng ký
  register: async (registerData: RegisterRequest): Promise<AuthResponse> => {
    await delay(1200); // Simulate API call delay

    const users = getMockUsers();

    // Kiểm tra email đã tồn tại
    const existingUser = users.find((u) => u.email === registerData.email);
    if (existingUser) {
      throw new Error("Email đã được sử dụng");
    }

    // Tạo user mới
    const newUser: User = {
      id: generateId(),
      email: registerData.email,
      fullName: registerData.fullName,
      phoneNumber: registerData.phoneNumber,
      role: "user",
      createdAt: new Date().toISOString(),
      isEmailVerified: false,
    };

    // Thêm user vào danh sách
    users.push(newUser);
    saveMockUsers(users);

    const token = generateToken();

    // Lưu thông tin đăng nhập
    localStorage.setItem(AUTH_TOKEN_KEY, token);
    localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(newUser));

    return {
      user: newUser,
      token,
    };
  },

  // Đăng xuất
  logout: async (): Promise<void> => {
    try {
      // Xóa tất cả các token và user data
      localStorage.removeItem(AUTH_TOKEN_KEY);
      localStorage.removeItem(CURRENT_USER_KEY);
      localStorage.removeItem("accessToken"); // Xóa token từ localStorageService
    } catch (error) {
      console.error("Logout error:", error);
      // Vẫn tiếp tục xóa local data ngay cả khi có lỗi
    }
  },

  // Lấy thông tin user hiện tại
  getCurrentUser: (): User | null => {
    const userStr = localStorage.getItem(CURRENT_USER_KEY);
    const token = localStorage.getItem(AUTH_TOKEN_KEY);

    if (!userStr || !token) {
      return null;
    }

    try {
      return JSON.parse(userStr);
    } catch {
      return null;
    }
  },

  // Kiểm tra token có hợp lệ không
  isAuthenticated: (): boolean => {
    const token = localStorage.getItem(AUTH_TOKEN_KEY);
    const user = localStorage.getItem(CURRENT_USER_KEY);

    return !!(token && user);
  },

  // Lấy token
  getToken: (): string | null => {
    return localStorage.getItem(AUTH_TOKEN_KEY);
  },

  // Cập nhật thông tin user
  updateProfile: async (userData: Partial<User>): Promise<User> => {
    await delay(800);

    const currentUser = authService.getCurrentUser();
    if (!currentUser) {
      throw new Error("Chưa đăng nhập");
    }

    const users = getMockUsers();
    const userIndex = users.findIndex((u) => u.id === currentUser.id);

    if (userIndex === -1) {
      throw new Error("Không tìm thấy user");
    }

    // Cập nhật user
    const updatedUser = { ...users[userIndex], ...userData };
    users[userIndex] = updatedUser;
    saveMockUsers(users);

    // Cập nhật current user
    localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(updatedUser));

    return updatedUser;
  },

  // Đổi mật khẩu
  changePassword: async (
    oldPassword: string,
    newPassword: string
  ): Promise<void> => {
    await delay(800);

    // Trong mock này, ta giả sử old password luôn đúng nếu = "123456"
    if (oldPassword !== "123456") {
      throw new Error("Mật khẩu cũ không chính xác");
    }

    // Trong thực tế sẽ gửi API để đổi password
    // Ở đây ta chỉ simulate thành công
    console.log("Password changed successfully (mock)");
  },

  // Quên mật khẩu
  forgotPassword: async (email: string): Promise<void> => {
    await delay(1000);

    const users = getMockUsers();
    const user = users.find((u) => u.email === email);

    if (!user) {
      throw new Error("Email không tồn tại trong hệ thống");
    }

    // Trong thực tế sẽ gửi email reset password
    console.log("Password reset email sent (mock)");
  },

  // Verify email
  verifyEmail: async (token: string): Promise<void> => {
    await delay(800);

    const currentUser = authService.getCurrentUser();
    if (!currentUser) {
      throw new Error("Chưa đăng nhập");
    }

    // Update email verification status
    const updatedUser = { ...currentUser, isEmailVerified: true };
    const users = getMockUsers();
    const userIndex = users.findIndex((u) => u.id === currentUser.id);

    if (userIndex !== -1) {
      users[userIndex] = updatedUser;
      saveMockUsers(users);
      localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(updatedUser));
    }
  },
};

// Initialize mock users on first load
initializeMockUsers();
