import React from "react";
import { ChevronUp } from "lucide-react";

interface Props {
  category: "vehicle" | "battery";
  setCategory: (value: "vehicle" | "battery") => void;
}

const CategorySelectorCard: React.FC<Props> = ({ category, setCategory }) => {
  return (
    <div className="border border-[#E5E5E5] rounded-xl overflow-hidden shadow-sm bg-white mb-6">
      <div className="bg-[#A8E6CF]/40 px-4 py-2 flex justify-between items-center cursor-pointer">
        <span className="text-[#2ECC71] font-medium">
          Chọn chuyên mục đăng tin
        </span>
        <ChevronUp className="w-4 h-4 text-[#2ECC71]" />
      </div>

      <div className="p-4">
        <label className="block text-sm text-[#2C3E50] mb-1 font-medium">
          Danh mục <span className="text-red-500">*</span>
        </label>

        <select
          value={category}
          onChange={(e) =>
            setCategory(e.target.value as "vehicle" | "battery")
          }
          className="w-full border border-[#E5E5E5] rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#2ECC71] outline-none text-[#2C3E50]"
        >
          <option value="vehicle">Xe điện / Bán xe điện</option>
          <option value="battery">Pin xe điện / Bán pin xe điện</option>
        </select>
      </div>
    </div>
  );
};

export default CategorySelectorCard;
