import React, { useState } from "react";

const ChangePasswordPage = () => {
    const [formData, setFormData] = useState({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
    });

    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    const handleChange = (e: React.FormEvent<HTMLInputElement>) => {
        setFormData({
            ...formData,
            [e.currentTarget.name]: e.currentTarget.value,
        });
        setError("");
        setSuccess("");
    };

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (formData.newPassword !== formData.confirmPassword) {
            setError("Mật khẩu xác nhận không khớp!");
            return;
        }
        if (formData.newPassword.length < 6) {
            setError("Mật khẩu mới phải có ít nhất 6 ký tự!");
            return;
        }
        setSuccess("Đổi mật khẩu thành công!");
        setFormData({ currentPassword: "", newPassword: "", confirmPassword: "" });
    };

    return (
        <div className=" min-h-screen ">
            <div className="bg-white p-6 rounded-lg shadow-md w-full max-w-md">
                <h2 className="text-base font-semibold mb-4">Thay đổi mật khẩu</h2>

                <form onSubmit={handleSubmit} className="space-y-3">
                    <div>
                        <input
                            type="password"
                            name="currentPassword"
                            placeholder="Mật khẩu hiện tại *"
                            value={formData.currentPassword}
                            onChange={handleChange}
                            className="w-full border rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-orange-400"
                            required
                        />
                    </div>

                    <div>
                        <input
                            type="password"
                            name="newPassword"
                            placeholder="Mật khẩu mới *"
                            value={formData.newPassword}
                            onChange={handleChange}
                            className="w-full border rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-orange-400"
                            required
                        />
                    </div>

                    <div>
                        <input
                            type="password"
                            name="confirmPassword"
                            placeholder="Xác nhận mật khẩu mới *"
                            value={formData.confirmPassword}
                            onChange={handleChange}
                            className="w-full border rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-orange-400"
                            required
                        />
                    </div>

                    {error && <p className="text-red-500 text-sm">{error}</p>}
                    {success && <p className="text-green-600 text-sm">{success}</p>}

                    <button
                        type="submit"
                        className="bg-orange-500 text-white text-sm font-semibold px-4 py-2 rounded hover:bg-orange-600 transition"
                    >
                        ĐỔI MẬT KHẨU
                    </button>
                </form>
            </div>
        </div>
    );
};

export default ChangePasswordPage;
