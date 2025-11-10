// src/pages/authenticate/Authenticate.tsx
import { useNavigate, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import { Box, CircularProgress, Typography } from "@mui/material";
import { useToast } from "../../contexts/ToastContext";

const AUTH_TOKEN_KEY = "auth_token";
const CURRENT_USER_KEY = "current_user";

type UserStatus =
  | "ACTIVE"
  | "BANNED"
  | "PENDING"
  | "SUSPENDED"
  | "DEACTIVATED"
  | "INACTIVE"
  | string;

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

export default function Authenticate() {
  const navigate = useNavigate();
  const location = useLocation();
  const [busy, setBusy] = useState(true);
  const { showToast } = useToast();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const code = params.get("code");
    const state = params.get("state");

    // (Optional) xác thực state chống CSRF nếu lúc tạo URL bạn đã lưu
    const expectedState = sessionStorage.getItem("oauth_state");
    if (expectedState && state && expectedState !== state) {
      console.error("State mismatch");
      sessionStorage.removeItem("oauth_state");
      navigate("/dang-nhap", {
        replace: true,
        state: { error: "Phiên đăng nhập không hợp lệ, vui lòng thử lại." },
      });
      return;
    }
    // dọn state sau khi dùng
    sessionStorage.removeItem("oauth_state");

    if (!code) {
      navigate("/dang-nhap", {
        replace: true,
        state: { error: "Thiếu mã xác thực từ Google." },
      });
      return;
    }

    (async () => {
      try {
        // Gọi BE đổi code -> token (+ user nếu BE trả)
        const res = await fetch(
          `http://localhost:8080/evplatform/auth/outbound/authentication?code=${encodeURIComponent(
            code
          )}`,
          { method: "POST", headers: { Accept: "application/json" } }
        );

        const data = await res.json().catch((err) => {
          console.error("Failed to parse response:", err);
          return {};
        });

        console.log("OAuth response:", data);

        if (!res.ok || data.code !== 1000) {
          console.error("OAuth error:", data);
          throw new Error(data.message || `Đổi code thất bại (${res.status})`);
        }

        const token: string | undefined = data?.result?.token;

        if (!token) {
          console.error("No token in response:", data);
          throw new Error("Backend không trả về token.");
        }

        // ✅ Lưu token trước để axios interceptor có thể dùng
        localStorage.setItem(AUTH_TOKEN_KEY, token);

        // ✅ Lấy user info từ backend và format đúng như authService.login()
        try {
          console.log("📥 Fetching user info from /users/myInfo...");
          const meRes = await fetch(
            "http://localhost:8080/evplatform/users/myInfo",
            {
              headers: { Authorization: `Bearer ${token}` },
            }
          );

          if (!meRes.ok) {
            throw new Error(`Failed to fetch user info: ${meRes.status}`);
          }

          const meData = await meRes.json();
          console.log("✅ User info response:", meData);

          if (meData?.code !== 1000 || !meData?.result) {
            throw new Error("Invalid user info response");
          }

          const backendUser = meData.result;
          const normalizedStatus = normalizeStatus(backendUser.status);
          if (normalizedStatus === "BANNED") {
            clearSession();
            showToast(
              "Tài khoản của bạn đã bị cấm. Vui lòng liên hệ hỗ trợ để biết thêm chi tiết.",
              "error"
            );
            navigate("/dang-nhap", {
              replace: true,
            });
            return;
          }

          const deriveRoleFromToken = (jwt: string): "user" | "admin" => {
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

          const normalizedEmail = String(
            backendUser.email || backendUser.username || ""
          )
            .trim()
            .toLowerCase();

          const user = {
            id: String(backendUser.userId || ""),
            email: normalizedEmail,
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

          console.log("✅ Final user object:", user);
          localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
        } catch (error) {
          clearSession();
          throw error;
        }

        // 🔧 Dọn query cho đẹp URL & tránh re-run khi refresh
        const cleanUrl = window.location.pathname;
        window.history.replaceState({}, "", cleanUrl);

        // Điều hướng về trang trước nếu có (React Router location.state.from)
        const from =
          (location.state as any)?.from?.pathname ||
          sessionStorage.getItem("post_login_redirect") ||
          "/";
        sessionStorage.removeItem("post_login_redirect");

        // ✅ Reload page để AuthContext đọc lại user từ localStorage
        // Điều này đảm bảo user state được cập nhật trong toàn bộ app
        window.location.href = from;
      } catch (err) {
        console.error(err);
        clearSession();
        showToast(
          (err as Error).message || "Đăng nhập thất bại. Vui lòng thử lại sau.",
          "error"
        );
        navigate("/dang-nhap", {
          replace: true,
        });
      } finally {
        setBusy(false);
      }
    })();
  }, [navigate, location.state, showToast]);

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        gap: "16px",
        justifyContent: "center",
        alignItems: "center",
        height: "100vh",
      }}
    >
      <CircularProgress />
      <Typography>
        {busy ? "Authenticating..." : "Đang chuyển hướng..."}
      </Typography>
    </Box>
  );
}
