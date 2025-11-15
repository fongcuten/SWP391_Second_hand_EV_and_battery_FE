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
    status: string;
    bio: string;
    avatarUrl: string;
    avatarPublicId: string;
    avatarThumbUrl: string;
    plan: Plan;
    planStatus: string;
    quotaRemaining: number;
    startAt: string;
    endAt: string;
    createdAt: string;
    updatedAt: string;
}

export const UserService = {
    async getMyInfo(): Promise<User> {
        try {
            const response = await api.get("/users/myInfo");
            return response.data.result;
        } catch (error: any) {
            console.error("❌ Error fetching user info:", error);
            throw error;
        }
    },

    async updateMyInfo(profileData: Partial<User>): Promise<User> {
        const userId = profileData.userId;
        try {
            const response = await api.put(`/users/${userId}`, profileData);
            return response.data.result;
        } catch (error: any) {
            console.error("❌ Error updating user info:", error);
            throw error;
        }
    },

    async uploadAvatar(file: File): Promise<User> {
        try {
            const formData = new FormData();
            formData.append("file", file);

            const response = await api.post("/users/me/avatar", formData);

            // Assuming the response contains the updated user object in the 'result' field
            return response.data.result;
        } catch (error: any) {
            console.error("❌ Error uploading avatar:", error);
            throw error;
        }
    },

    async deleteAvatar(): Promise<void> {
        try {
            await api.delete("/users/me/avatar");
        } catch (error: any) {
            console.error("❌ Error deleting avatar:", error);
            throw error;
        }
    },
};