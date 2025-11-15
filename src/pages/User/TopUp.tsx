import { useState, useMemo } from "react";

const QUICK_AMOUNTS = [50000, 100000, 200000, 500000, 1000000, 2000000];

const BONUS_TIERS = [
    { min: 0, max: 499999, percent: 0 },
    { min: 500000, max: 999999, percent: 3 },
    { min: 1000000, max: 1999999, percent: 5 },
    { min: 2000000, max: 4999999, percent: 7 },
    { min: 5000000, max: 9999999, percent: 9 },
    { min: 10000000, max: 19999999, percent: 11 },
    { min: 20000000, max: 49999999, percent: 13 },
    { min: 50000000, max: 2000000000, percent: 15 },
];

export default function PaymentPage() {
    const [amount, setAmount] = useState<number | "">("");
    const [selected, setSelected] = useState<number | null>(null);

    const handleSelect = (value: number) => {
        setAmount(value);
        setSelected(value);
    };

    // Compute bonus % and bonus amount
    const bonusPercent = useMemo(() => {
        if (!amount) return 0;
        const tier = BONUS_TIERS.find(
            (t) => amount >= t.min && amount <= t.max
        );
        return tier ? tier.percent : 0;
    }, [amount]);

    const bonusAmount = useMemo(() => {
        if (!amount) return 0;
        return Math.floor((amount * bonusPercent) / 100);
    }, [amount, bonusPercent]);

    const totalReceived = useMemo(() => {
        if (!amount) return 0;
        return amount + bonusAmount;
    }, [amount, bonusAmount]);

    return (

        <div className="w-full max-w-5xl bg-white rounded-2xl shadow-md border border-gray-100 p-8">
            {/* Header */}
            <h2 className="text-2xl font-bold text-[#2C3E50] mb-6">Nạp tiền</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* LEFT SIDE */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Số tiền cần nạp <span className="text-red-500">*</span>
                    </label>
                    <div className="border border-gray-300 rounded-lg ">         
                        <input
                            type="number"
                            placeholder="Nhập số tiền cần nạp"
                            value={amount}
                            onChange={(e) => {
                                const val = Number(e.target.value);
                                setAmount(isNaN(val) ? "" : val);
                                setSelected(null);
                            }}
                            className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-[#2ECC71] focus:border-transparent transition"
                        />
                    </div>

                    {/* Quick amount buttons */}
                    <div className="grid grid-cols-3 gap-3 mt-4">
                        {QUICK_AMOUNTS.map((value) => (
                            <button
                                key={value}
                                onClick={() => handleSelect(value)}
                                className={`py-2 rounded-lg font-semibold border transition ${selected === value
                                    ? "bg-[#2ECC71] text-white border-[#2ECC71]"
                                    : "bg-[#FFF7F5] border-[#F1D1C2] text-gray-700 hover:bg-[#2ECC71]/10"
                                    }`}
                            >
                                {value.toLocaleString("vi-VN")}
                            </button>
                        ))}
                    </div>

                    {/* Summary */}
                    <div className="mt-6 bg-[#F7F9F9] rounded-lg p-4 space-y-2 border border-gray-200 text-sm">
                        <div className="flex justify-between text-gray-700">
                            <span>Tài khoản chính</span>
                            <span className="font-semibold">
                                + {amount ? amount.toLocaleString("vi-VN") : "0"}
                            </span>
                        </div>
                        <div className="flex justify-between text-gray-700">
                            <span>Khuyến mãi ({bonusPercent}%)</span>
                            <span className="font-semibold text-[#2C3E50]">
                                + {bonusAmount.toLocaleString("vi-VN")}
                            </span>
                        </div>
                        <div className="flex justify-between text-[#2ECC71] font-semibold border-t border-gray-200 pt-2">
                            <span>Tổng tiền nhận được</span>
                            <span>+ {totalReceived.toLocaleString("vi-VN")}</span>
                        </div>
                    </div>

                    <p className="text-xs text-gray-500 mt-3 italic">
                        *Bạn có thể gửi yêu cầu xuất hoá đơn GTGT tại trang Lịch sử giao
                        dịch trong vòng 24h sau khi phát sinh giao dịch.
                    </p>
                </div>

                {/* RIGHT SIDE */}
                <div className="">

                    {/* Bonus Table */}
                    <div className="overflow-hidden border border-gray-300 rounded-lg">
                        <table className="w-full text-sm text-left border-collapse">
                            <thead className="bg-[#A8E6CF] text-[#2C3E50]">
                                <tr>
                                    <th className="py-2 px-3">Mức nạp từ</th>
                                    <th className="py-2 px-3 text-right">% Tặng</th>
                                </tr>
                            </thead>
                            <tbody>
                                {BONUS_TIERS.map((row, index) => (
                                    <tr
                                        key={index}
                                        className={`border-t border-gray-200 ${index % 2 === 0 ? "bg-white" : "bg-[#F7F9F9]"
                                            }`}
                                    >
                                        <td className="py-2 px-3">
                                            {row.min.toLocaleString("vi-VN")} -{" "}
                                            {row.max.toLocaleString("vi-VN")} đ
                                        </td>
                                        <td className="py-2 px-3 text-right font-medium text-[#2C3E50]">
                                            {row.percent}%
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* Footer */}
            <div className="flex justify-end mt-8">
                <button
                    className="bg-[#2ECC71] hover:bg-[#27AE60] text-white font-semibold py-3 px-8 rounded-xl transition shadow-sm disabled:opacity-50"
                    disabled={!amount}
                >
                    Tiếp tục
                </button>
            </div>
        </div>

    );
}
