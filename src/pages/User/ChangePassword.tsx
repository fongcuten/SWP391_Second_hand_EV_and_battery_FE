import React, { useState } from "react";

const ChangePasswordPage = () => {
  const [formData, setFormData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    setError("");
    setSuccess("");
  };

  const handleSubmit = (e: React.FormEvent) => {
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
    <div className="flex justify-center">
      <div className="bg-white w-full max-w-md rounded-2xl shadow-lg border border-[#A8E6CF]/50 p-8">
        <h2 className="text-2xl font-semibold text-[#2C3E50] text-center mb-6">
          Thay đổi mật khẩu
        </h2>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="text-sm font-medium text-[#2C3E50] block mb-1">
              Mật khẩu hiện tại
            </label>
            <input
              type="password"
              name="currentPassword"
              placeholder="Nhập mật khẩu hiện tại"
              value={formData.currentPassword}
              onChange={handleChange}
              className="w-full border border-[#A8E6CF]/70 rounded-lg px-3 py-2 text-sm text-[#2C3E50]
              focus:outline-none focus:ring-2 focus:ring-[#2ECC71]/70 transition"
              required
            />
          </div>

          <div>
            <label className="text-sm font-medium text-[#2C3E50] block mb-1">
              Mật khẩu mới
            </label>
            <input
              type="password"
              name="newPassword"
              placeholder="Nhập mật khẩu mới"
              value={formData.newPassword}
              onChange={handleChange}
              className="w-full border border-[#A8E6CF]/70 rounded-lg px-3 py-2 text-sm text-[#2C3E50]
              focus:outline-none focus:ring-2 focus:ring-[#2ECC71]/70 transition"
              required
            />
          </div>

          <div>
            <label className="text-sm font-medium text-[#2C3E50] block mb-1">
              Xác nhận mật khẩu mới
            </label>
            <input
              type="password"
              name="confirmPassword"
              placeholder="Nhập lại mật khẩu mới"
              value={formData.confirmPassword}
              onChange={handleChange}
              className="w-full border border-[#A8E6CF]/70 rounded-lg px-3 py-2 text-sm text-[#2C3E50]
              focus:outline-none focus:ring-2 focus:ring-[#2ECC71]/70 transition"
              required
            />
          </div>

          {error && (
            <p className="text-red-500 text-sm text-center mt-2">{error}</p>
          )}
          {success && (
            <p className="text-[#2ECC71] text-sm text-center mt-2">{success}</p>
          )}

          <button
            type="submit"
            className="w-full bg-[#2ECC71] hover:bg-[#29b765] text-white text-sm font-semibold px-4 py-2 rounded-lg shadow-md transition-all duration-300"
          >
            ĐỔI MẬT KHẨU
          </button>
        </form>
      </div>
    </div>
  );
};

export default ChangePasswordPage;
