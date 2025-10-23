import React, { useMemo, useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import ProfileCard from "../components/ProfileCard";
import { Outlet } from "react-router-dom";

// src/mocks/mockUser.ts

export const mockUser = {
    id: "USR001",
    name: "Nguyễn Văn A",
    email: "nguyenvana@example.com",
    phone: "0909123456",
    avatar: "https://i.pravatar.cc/150?img=32",
    joinedDate: "2023-06-15",
    address: "123 Nguyễn Trãi, Quận 1, TP. Hồ Chí Minh",
    totalPosts: 18,
    activePosts: 12,
    expiredPosts: 6,
    membership: "Thành viên VIP",
};


export default function UserHome() {
    const auth = useAuth();
    const user = auth?.user ?? mockUser;
    return (
        <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 pt-24">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-6">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
                    {/* left column: ensure bottom margin and allow card to stretch */}
                    <div className="col-span-1 flex flex-col mb-6">
                        <ProfileCard user={mockUser} />
                    </div>

                    {/* right column: make posts feed stretch to match left height */}
                    <div className="col-span-2 flex flex-col">
                        <Outlet />
                    </div>
                </div>
            </div>
        </div>
    );
}