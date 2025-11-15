import React, { useState, useEffect } from "react";
import { locationService } from "../services/locationService";

const LocationTest: React.FC = () => {
  const [provinces, setProvinces] = useState<any[]>([]);
  const [districts, setDistricts] = useState<any[]>([]);
  const [wards, setWards] = useState<any[]>([]);
  const [selectedProvince, setSelectedProvince] = useState<string>("");
  const [selectedDistrict, setSelectedDistrict] = useState<string>("");
  const [selectedWard, setSelectedWard] = useState<string>("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadProvinces();
  }, []);

  const loadProvinces = async () => {
    setLoading(true);
    try {
      const data = await locationService.getProvinces();
      console.log("Loaded provinces:", data);
      setProvinces(data);
    } catch (error) {
      console.error("Error loading provinces:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleProvinceChange = async (
    e: React.ChangeEvent<HTMLSelectElement>
  ) => {
    const provinceCode = e.target.value;
    setSelectedProvince(provinceCode);
    setSelectedDistrict("");
    setSelectedWard("");
    setDistricts([]);
    setWards([]);

    if (provinceCode) {
      setLoading(true);
      try {
        const data = await locationService.getDistricts(Number(provinceCode));
        console.log("Loaded districts:", data);
        setDistricts(data);
      } catch (error) {
        console.error("Error loading districts:", error);
      } finally {
        setLoading(false);
      }
    }
  };

  const handleDistrictChange = async (
    e: React.ChangeEvent<HTMLSelectElement>
  ) => {
    const districtCode = e.target.value;
    setSelectedDistrict(districtCode);
    setSelectedWard("");
    setWards([]);

    if (districtCode) {
      setLoading(true);
      try {
        const data = await locationService.getWards(Number(districtCode));
        console.log("Loaded wards:", data);
        setWards(data);
      } catch (error) {
        console.error("Error loading wards:", error);
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-6 text-center">Test API Địa Chỉ</h2>

      <div className="space-y-4">
        {/* Province */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Tỉnh/Thành phố *
          </label>
          <select
            value={selectedProvince}
            onChange={handleProvinceChange}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
            disabled={loading}
          >
            <option value="">Chọn tỉnh/thành phố</option>
            {provinces.map((province) => (
              <option key={province.code} value={province.code}>
                {province.name}
              </option>
            ))}
          </select>
          <p className="text-xs text-gray-500 mt-1">
            Tổng số tỉnh: {provinces.length}
          </p>
        </div>

        {/* District */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Quận/Huyện *
          </label>
          <select
            value={selectedDistrict}
            onChange={handleDistrictChange}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
            disabled={loading || !selectedProvince}
          >
            <option value="">Chọn quận/huyện</option>
            {districts.map((district) => (
              <option key={district.code} value={district.code}>
                {district.name}
              </option>
            ))}
          </select>
          <p className="text-xs text-gray-500 mt-1">
            Tổng số quận/huyện: {districts.length}
          </p>
        </div>

        {/* Ward */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Phường/Xã *
          </label>
          <select
            value={selectedWard}
            onChange={(e) => setSelectedWard(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
            disabled={loading || !selectedDistrict}
          >
            <option value="">Chọn phường/xã</option>
            {wards.map((ward) => (
              <option key={ward.code} value={ward.code}>
                {ward.name}
              </option>
            ))}
          </select>
          <p className="text-xs text-gray-500 mt-1">
            Tổng số phường/xã: {wards.length}
          </p>
        </div>

        {/* Loading indicator */}
        {loading && (
          <div className="text-center py-4">
            <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
            <span className="ml-2 text-sm text-gray-600">Đang tải...</span>
          </div>
        )}

        {/* Debug info */}
        <div className="mt-6 p-4 bg-gray-100 rounded-lg">
          <h3 className="font-medium text-gray-700 mb-2">Debug Info:</h3>
          <div className="text-sm text-gray-600 space-y-1">
            <p>Selected Province: {selectedProvince || "None"}</p>
            <p>Selected District: {selectedDistrict || "None"}</p>
            <p>Selected Ward: {selectedWard || "None"}</p>
          </div>
        </div>

        {/* Test API button */}
        <div className="text-center">
          <button
            onClick={loadProvinces}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
            disabled={loading}
          >
            Reload Provinces
          </button>
        </div>
      </div>
    </div>
  );
};

export default LocationTest;
