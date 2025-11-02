import api from "../../config/axios";

export interface UserSubscription {
  planId: number;
  planName: string;
  price: number;
  status: string;
  startAt: string;
  endAt: string;
}

export interface UserSubscriptionResponse {
  code: number;
  result: UserSubscription;
}

export interface CheckoutResponse {
  sessionId: string;
  url: string;
}

export class UserSubscriptionService {
  /**
   * Create Stripe checkout session
   * POST /users/me/plan/checkout
   */
  static async createCheckout(planName: string): Promise<string> {
    console.log("🛒 Creating checkout for plan:", planName);

    try {
      // ✅ Correct endpoint matching backend
      const response = await api.post("/users/me/plan/checkout", {
        planName: planName,
      });

      console.log("✅ Checkout response:", response.data);

      const result = response.data.result;
      
      // ✅ Return URL string directly
      if (!result?.url) {
        throw new Error("Không nhận được URL thanh toán từ server");
      }

      return result.url; // ✅ Return string, not object

    } catch (error: any) {
      console.error("❌ Error creating checkout:", error);

      if (error.response?.status === 404) {
        throw new Error("API endpoint không tồn tại. Vui lòng kiểm tra cấu hình backend.");
      }

      if (error.response?.status === 401) {
        throw new Error("Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại.");
      }

      const message = error.response?.data?.message || "Lỗi khi tạo thanh toán";
      throw new Error(message);
    }
  }

  /**
   * Activate plan from Stripe session
   * POST /users/me/plan/checkout/activate-from-session
   */
  static async activateFromSession(sessionId: string): Promise<void> {
    console.log("🎯 Activating plan from session:", sessionId);

    try {
      const response = await api.post(
        "/users/me/plan/checkout/activate-from-session",
        {
          sessionId: sessionId,
        }
      );

      console.log("✅ Plan activated:", response.data);
    } catch (error: any) {
      console.error("❌ Error activating plan:", error);

      const message = error.response?.data?.message || "Lỗi khi kích hoạt gói";
      throw new Error(message);
    }
  }
}