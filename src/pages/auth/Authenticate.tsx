// src/pages/authenticate/Authenticate.tsx
import { useNavigate, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import { Box, CircularProgress, Typography } from "@mui/material";

const AUTH_TOKEN_KEY = "auth_token";
const CURRENT_USER_KEY = "current_user";

export default function Authenticate() {
  const navigate = useNavigate();
  const location = useLocation();
  const [busy, setBusy] = useState(true);

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

          if (meRes.ok) {
            const meData = await meRes.json();
            console.log("✅ User info response:", meData);

            if (meData?.code === 1000 && meData?.result) {
              const backendUser = meData.result;

              // Derive role from token
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

              // ✅ Format user object giống authService.login()
              const user = {
                id: String(backendUser.userId || ""),
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
                createdAt: backendUser.createdAt || new Date().toISOString(),
                isEmailVerified: true,
              };

              console.log("✅ Final user object:", user);
              localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
            } else {
              throw new Error("Invalid user info response");
            }
          } else {
            throw new Error(`Failed to fetch user info: ${meRes.status}`);
          }
        } catch (error) {
          console.error("❌ Error fetching user info:", error);
          // Fallback: tạo minimal user từ token
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

          const subject = (() => {
            try {
              const parts = token.split(".");
              if (parts.length !== 3) return "";
              const base64 = parts[1].replace(/-/g, "+").replace(/_/g, "/");
              const json = atob(base64);
              const payload = JSON.parse(json);
              return payload?.sub || "";
            } catch {
              return "";
            }
          })();

          const fallbackUser = {
            id: subject || "unknown",
            email: subject || "",
            fullName: subject || "Google User",
            phoneNumber: "",
            role: deriveRoleFromToken(token),
            createdAt: new Date().toISOString(),
            isEmailVerified: true,
          };

          console.warn("⚠️ Using fallback user:", fallbackUser);
          localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(fallbackUser));
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
        navigate("/dang-nhap", {
          replace: true,
          state: { error: (err as Error).message || "Đăng nhập thất bại." },
        });
      } finally {
        setBusy(false);
      }
    })();
  }, [navigate, location.state]);

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
