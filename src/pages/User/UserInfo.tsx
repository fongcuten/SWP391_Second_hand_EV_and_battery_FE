import React from "react";

interface UserInfoFormProps {
  onSave?: () => void;
}

/* --- Reusable Fields --- */
interface InputFieldProps {
  label: string;
  placeholder?: string;
  type?: string;
  value?: string;
  readOnly?: boolean;
  disabled?: boolean;
}

const InputField: React.FC<InputFieldProps> = ({
  label,
  placeholder,
  type = "text",
  value,
  readOnly,
  disabled,
}) => (
  <div >
    <label className="block text-sm font-medium text-[#2C3E50] mb-1">
      {label}
    </label>
    <div className="border border-gray-300 rounded-lg">

            <input
              type={type}
              placeholder={placeholder}
              value={value}
              readOnly={readOnly}
              disabled={disabled}
              className={`w-full rounded-lg px-3 py-2.5 text-sm focus:outline-none 
                ${
                  disabled
                  ? "bg-gray-100 text-gray-500 cursor-not-allowed border border-gray-300 opacity-75"
                  : "border border-gray-300 focus:ring-2 focus:ring-[#2ECC71] focus:border-[#2ECC71] bg-white text-[#2C3E50]"
                }`}
                />
          </div>
    </div>
);

interface TextareaFieldProps {
  label: string;
  placeholder?: string;
  hint?: string;
}

const TextareaField: React.FC<TextareaFieldProps> = ({
  label,
  placeholder,
  hint,
}) => (
  <div>
    <label className="block text-sm font-medium text-[#2C3E50] mb-1">
      {label}
    </label>
    <div className="border border-gray-300 rounded-lg">
      <textarea
        rows={3}
        placeholder={placeholder}
        className="w-full rounded-lg px-3 py-2.5 text-sm text-[#2C3E50] placeholder-gray-400 resize-none focus:outline-none focus:ring-2 focus:ring-[#2ECC71]"
      />
    </div>
    {hint && <p className="text-xs text-gray-500 mt-1">{hint}</p>}
  </div>
);

interface SelectFieldProps {
  label: string;
  options: string[];
}

const SelectField: React.FC<SelectFieldProps> = ({ label, options }) => (
  <div>
    <label className="block text-sm font-medium text-[#2C3E50] mb-1">
      {label}
    </label>
    <div className="border border-gray-300 rounded-lg">
      <select className="w-full rounded-lg px-3 py-2.5 text-sm text-[#2C3E50] bg-white focus:outline-none focus:ring-2 focus:ring-[#2ECC71]">
        {options.map((opt) => (
          <option key={opt}>{opt}</option>
        ))}
      </select>
    </div>
  </div>
);

const UserInfoForm: React.FC<UserInfoFormProps> = ({ onSave }) => {
  return (
    <div >
      <div className="max-w-3xl mx-auto bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden mb-10">
        {/* Header */}
        <div className="border-b border-gray-100 px-8 py-6 bg-gradient-to-r from-[#A8E6CF] to-white">
          <h2 className="text-2xl font-semibold text-[#2C3E50]">
            Hồ sơ cá nhân
          </h2>
          <p className="text-sm text-gray-600 mt-1">
            Quản lý thông tin cá nhân, địa chỉ và bảo mật tài khoản của bạn
          </p>
        </div>

        {/* Content */}
        <div className="p-8 space-y-10">
          {/* Thông tin cơ bản */}
          <section>
            <h3 className="text-lg font-semibold text-[#2C3E50] mb-4">
              Thông tin cơ bản
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <InputField label="Họ và tên" placeholder="Nhập họ và tên" />
              <InputField
                label="Số điện thoại"
                value="0932024785"
                readOnly
                disabled
              />
            </div>
            <div className="mt-5">
              <InputField label="Địa chỉ" placeholder="Nhập địa chỉ của bạn" />
            </div>
          </section>

          {/* Giới thiệu */}
          <section>
            <h3 className="text-lg font-semibold text-[#2C3E50] mb-4">
              Giới thiệu
            </h3>
            <TextareaField
              label="Giới thiệu"
              placeholder="Viết đôi dòng giới thiệu về bạn hoặc cửa hàng của bạn..."
            />
          </section>

          {/* Thông tin bảo mật */}
          <section>
            <h3 className="text-lg font-semibold text-[#2C3E50] mb-2">
              Thông tin bảo mật
            </h3>
            <p className="text-sm text-gray-500 mb-5">
              Chỉ bạn có thể xem và chỉnh sửa các thông tin này.
            </p>

            <div className="space-y-5">
              <div className="flex items-center gap-3">
                <div className="flex-1">
                  <InputField label="Email" placeholder="example@email.com" readonly disabled/>
                </div>
              </div>

              {[
                "CCCD / CMND / Hộ chiếu",
                "Thông tin xuất hoá đơn",
                "Danh mục yêu thích",
              ].map((label) => (
                <InputField key={label} label={label} />
              ))}
            </div>
          </section>

          {/* Thông tin cá nhân bổ sung */}
          <section>
            <h3 className="text-lg font-semibold text-[#2C3E50] mb-4">
              Thông tin cá nhân bổ sung
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <SelectField label="Giới tính" options={["Nam", "Nữ", "Khác"]} />
              <InputField label="Ngày, tháng, năm sinh" type="date" />
            </div>
          </section>

          {/* Save Button */}
          <div className="pt-6 border-t border-gray-100 flex justify-end">
            <button
              onClick={onSave}
              className="bg-[#2ECC71] text-white text-sm font-medium px-8 py-2.5 rounded-lg shadow hover:bg-[#27AE60] transition-all"
            >
              Lưu thay đổi
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserInfoForm;
