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

        const data = await res.json().catch(() => ({}));
        if (!res.ok || data.code !== 1000) {
          throw new Error(data.message || Đổi code thất bại (${res.status}));
        }

        const token: string | undefined = data?.result?.token;
        const user: any = data?.result?.user;

        if (!token) throw new Error("Backend không trả về token.");

        // ✅ Lưu đúng key mà axios interceptor đang đọc
        localStorage.setItem(AUTH_TOKEN_KEY, token);

        // ✅ Lưu current user (nếu BE trả) — nếu không, bạn có thể gọi /me để lấy
        if (user) {
          localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
        } else {
          // Fallback: gọi /me để lấy user (nếu bạn có endpoint này)
          try {
            const meRes = await fetch(
              "http://localhost:8080/evplatform/users/me",
              {
                headers: { Authorization: Bearer ${token} },
              }
            );
            if (meRes.ok) {
              const me = await meRes.json();
              // tuỳ cấu trúc me, có thể cần me.result
              localStorage.setItem(
                CURRENT_USER_KEY,
                JSON.stringify(me.result ?? me)
              );
            }
          } catch {
            /* ignore nếu chưa có /me */
          }
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

        navigate(from, { replace: true });
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