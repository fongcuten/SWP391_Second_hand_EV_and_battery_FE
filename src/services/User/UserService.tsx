import api from "../../config/axios";

export interface Plan {
    name: string;
    description: string;
    price: number;
    durationDays: number;
    currency: string;
    maxPosts: number;
    priorityLevel: number;
}

export interface User {
    userId: number;
    username: string;
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    wallet: number;
    provinceCode: number;
    districtCode: number;
    wardCode: number;
    bio: string;
    plan: Plan | null;
    planStatus: string;
    startAt: string;
    endAt: string;
    createdAt: string;
    updatedAt: string;
}

interface ApiResponse<T> {
    code: number;
    message: string;
    result: T;
}

export const userService = {
    // async getUserById(userId: number): Promise<User> {
    //     try {
    //         const response = await api.get<ApiResponse<User>>(`/users/${userId}`);
    //         console.log("✅ User fetched:", response.data.result);
    //         return response.data.result;
    //     } catch (error: any) {
    //         console.error("❌ Error fetching user:", error);
    //         throw error;
    //     }
    // },

    async getCurrentUser(): Promise<User> {
        try {
            const response = await api.get<ApiResponse<User>>("/users/myInfo");
            console.log("✅ Current user fetched:", response.data.result);
            return response.data.result;
        } catch (error: any) {
            console.error("❌ Error fetching current user:", error);
            throw error;
        }
    },
};