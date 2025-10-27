import React, { useState, useEffect } from "react";
import {
  locationService,
  type Province,
  type District,
  type Ward,
} from "../../services/locationService";

interface LocationSelectorProps {
  provinceCode: number | null;
  districtCode: number | null;
  wardCode: number | null;
  street: string;
  onLocationChange: (location: {
    province_code: number | null;
    district_code: number | null;
    ward_code: number | null;
    street: string;
  }) => void;
  disabled?: boolean;
}

const LocationSelector: React.FC<LocationSelectorProps> = ({
  provinceCode,
  districtCode,
  wardCode,
  street,
  onLocationChange,
  disabled = false,
}) => {
  const [provinces, setProvinces] = useState<Province[]>([]);
  const [districts, setDistricts] = useState<District[]>([]);
  const [wards, setWards] = useState<Ward[]>([]);
  const [loading, setLoading] = useState(false);

  // Load provinces on component mount
  useEffect(() => {
    const loadProvinces = async () => {
      setLoading(true);
      try {
        const provincesData = await locationService.getProvinces();
        setProvinces(provincesData);
      } catch (error) {
        console.error("Error loading provinces:", error);
      } finally {
        setLoading(false);
      }
    };
    loadProvinces();
  }, []);

  // Load districts when province changes
  useEffect(() => {
    if (provinceCode) {
      const loadDistricts = async () => {
        setLoading(true);
        try {
          const districtsData = await locationService.getDistricts(
            provinceCode
          );
          setDistricts(districtsData);
          setWards([]);
          onLocationChange({
            province_code: provinceCode,
            district_code: null,
            ward_code: null,
            street,
          });
        } catch (error) {
          console.error("Error loading districts:", error);
        } finally {
          setLoading(false);
        }
      };
      loadDistricts();
    } else {
      setDistricts([]);
      setWards([]);
    }
  }, [provinceCode, street, onLocationChange]);

  // Load wards when district changes
  useEffect(() => {
    if (districtCode) {
      const loadWards = async () => {
        setLoading(true);
        try {
          const wardsData = await locationService.getWards(districtCode);
          setWards(wardsData);
          onLocationChange({
            province_code: provinceCode,
            district_code: districtCode,
            ward_code: null,
            street,
          });
        } catch (error) {
          console.error("Error loading wards:", error);
        } finally {
          setLoading(false);
        }
      };
      loadWards();
    } else {
      setWards([]);
    }
  }, [districtCode, provinceCode, street, onLocationChange]);

  const handleProvinceChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value ? Number(e.target.value) : null;
    onLocationChange({
      province_code: value,
      district_code: null,
      ward_code: null,
      street,
    });
  };

  const handleDistrictChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value ? Number(e.target.value) : null;
    onLocationChange({
      province_code: provinceCode,
      district_code: value,
      ward_code: null,
      street,
    });
  };

  const handleWardChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value ? Number(e.target.value) : null;
    onLocationChange({
      province_code: provinceCode,
      district_code: districtCode,
      ward_code: value,
      street,
    });
  };

  const handleStreetChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onLocationChange({
      province_code: provinceCode,
      district_code: districtCode,
      ward_code: wardCode,
      street: e.target.value,
    });
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Province */}
        <div>
          <label className="block text-sm text-[#2C3E50] mb-1 font-medium">
            Tỉnh/Thành phố *
          </label>
          <select
            value={provinceCode || ""}
            onChange={handleProvinceChange}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#2ECC71] outline-none bg-white"
            disabled={loading || disabled}
          >
            <option value="">Chọn tỉnh/thành phố</option>
            {provinces.map((province) => (
              <option key={province.code} value={province.code}>
                {province.name}
              </option>
            ))}
          </select>
        </div>

        {/* District */}
        <div>
          <label className="block text-sm text-[#2C3E50] mb-1 font-medium">
            Quận/Huyện *
          </label>
          <select
            value={districtCode || ""}
            onChange={handleDistrictChange}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#2ECC71] outline-none bg-white"
            disabled={loading || disabled || !provinceCode}
          >
            <option value="">Chọn quận/huyện</option>
            {districts.map((district) => (
              <option key={district.code} value={district.code}>
                {district.name}
              </option>
            ))}
          </select>
        </div>

        {/* Ward */}
        <div>
          <label className="block text-sm text-[#2C3E50] mb-1 font-medium">
            Phường/Xã *
          </label>
          <select
            value={wardCode || ""}
            onChange={handleWardChange}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#2ECC71] outline-none bg-white"
            disabled={loading || disabled || !districtCode}
          >
            <option value="">Chọn phường/xã</option>
            {wards.map((ward) => (
              <option key={ward.code} value={ward.code}>
                {ward.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Street */}
      <div>
        <label className="block text-sm text-[#2C3E50] mb-1 font-medium">
          Địa chỉ chi tiết
        </label>
        <input
          type="text"
          value={street}
          onChange={handleStreetChange}
          placeholder="Số nhà, tên đường..."
          className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#2ECC71] outline-none bg-white"
          disabled={disabled}
        />
      </div>
    </div>
  );
};

export default LocationSelector;
