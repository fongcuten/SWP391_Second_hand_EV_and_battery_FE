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
    street: string; // ✅ Added street field
    bio: string;
    plan: Plan | null;
    planStatus: string;
    startAt: string;
    endAt: string;
    createdAt: string;
    updatedAt: string;
}

export interface UpdateUserRequest {
    firstName: string;
    lastName: string;
    email: string;
    provinceCode: number;
    districtCode: number;
    wardCode: number;
    street: string; // ✅ Added street field
    bio: string;
    password?: string;
}

interface ApiResponse<T> {
    code: number;
    message: string;
    result: T;
}

export const userService = {
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

    async updateUser(userId: number, data: UpdateUserRequest): Promise<User> {
        try {
            const response = await api.put<ApiResponse<User>>(`/users/${userId}`, data);
            console.log("✅ User updated:", response.data.result);
            return response.data.result;
        } catch (error: any) {
            console.error("❌ Error updating user:", error);
            throw error;
        }
    },
};