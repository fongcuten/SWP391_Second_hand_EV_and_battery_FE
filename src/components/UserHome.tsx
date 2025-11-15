import ProfileCard from "../components/ProfileCard";
import { Outlet } from "react-router-dom";

export default function UserHome() {
    return (
        <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 pt-24">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-6">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
                    {/* left column: ensure bottom margin and allow card to stretch */}
                    <div className="col-span-1 flex flex-col mb-6">
                        <ProfileCard/>
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