import api from "../../config/axios";

// ✅ FIX: Updated Plan interface to match the new API response
export interface Plan {
    name: string;
    description: string;
    price: number;
    durationDays: number;
    currency: string;
    maxPosts: number;
    priorityLevel: number;
}

// ✅ FIX: Updated User interface to match the new API response
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
    avatarUrl: string;
    avatarPublicId: string;
    avatarThumbUrl: string;
    plan: Plan;
    planStatus: string;
    startAt: string;
    endAt: string;
    createdAt: string;
    updatedAt: string;
}

export const UserService = {
    /**
     * Fetches the current logged-in user's information.
     */
    async getMyInfo(): Promise<User> {
        try {
            const response = await api.get("/users/myInfo");
            // ✅ FIX: Return the nested 'result' object from the response
            return response.data.result;
        } catch (error: any) {
            console.error("❌ Error fetching user info:", error);
            throw error;
        }
    },

    /**
     * Updates the current user's profile information.
     * @param profileData - The data to update.
     */
    async updateMyInfo(profileData: Partial<User>): Promise<User> {
        try {
            const response = await api.put("/users/myInfo", profileData);
            // ✅ FIX: Return the nested 'result' object from the response
            return response.data.result;
        } catch (error: any) {
            console.error("❌ Error updating user info:", error);
            throw error;
        }
    },

    /**
     * Uploads a new avatar for the current user.
     * @param file The image file to upload.
     */
    async uploadAvatar(file: File): Promise<User> {
        try {
            const formData = new FormData();
            formData.append("file", file);

            // ✅ FIX: Removed manual headers. The browser will set the correct
            // Content-Type with the required boundary for multipart/form-data.
            const response = await api.post("/users/me/avatar", formData);

            // Assuming the response contains the updated user object in the 'result' field
            return response.data.result;
        } catch (error: any) {
            console.error("❌ Error uploading avatar:", error);
            throw error;
        }
    },

    /**
     * Deletes the current user's avatar.
     */
    async deleteAvatar(): Promise<void> {
        try {
            await api.delete("/users/me/avatar");
        } catch (error: any) {
            console.error("❌ Error deleting avatar:", error);
            throw error;
        }
    },
};