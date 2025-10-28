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

export const UserSubscriptionService = {
  // Get current user's subscription plan
  getCurrentSubscription: async (): Promise<UserSubscription> => {
    try {
      const response = await api.get<UserSubscriptionResponse>("/users/me/plan");
      console.log("📦 User subscription API response:", response.data);

      return response.data.result;
    } catch (error: any) {
      console.error("❌ Error fetching subscription:", error);

      // Default to Free tier if error or no subscription
      return {
        planId: 1,
        planName: "Free",
        price: 0,
        status: "ACTIVE",
        startAt: new Date().toISOString(),
        endAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
      };
    }
  },

  // Get priority level from plan name
  getPriorityFromPlan: (planName: string): 1 | 2 | 3 => {
    const normalizedPlan = planName.toUpperCase();

    if (normalizedPlan.includes("PREMIUM")) {
      return 3;
    } else if (normalizedPlan.includes("STANDARD")) {
      return 2;
    } else {
      return 1; // Free or any other plan
    }
  },

  // Get subscription tier from plan name
  getSubscriptionTier: (planName: string): "FREE" | "STANDARD" | "PREMIUM" => {
    const normalizedPlan = planName.toUpperCase();

    if (normalizedPlan.includes("PREMIUM")) {
      return "PREMIUM";
    } else if (normalizedPlan.includes("STANDARD")) {
      return "STANDARD";
    } else {
      return "FREE";
    }
  },

  // Check if subscription is active
  isSubscriptionActive: (subscription: UserSubscription): boolean => {
    if (subscription.status !== "ACTIVE") {
      return false;
    }

    const now = new Date();
    const endDate = new Date(subscription.endAt);

    return endDate > now;
  },
};