import { useState } from "react";
import { Heart, MessageCircle } from "lucide-react";

const savedPosts = Array.from({ length: 40 }, (_, i) => ({
  id: i + 1,
  title: `Lexus RX300 ${2018 + (i % 6)} - ${20000 + i * 100} km`,
  image: "https://via.placeholder.com/160x120",
  price: `${(2620000000 + i * 10000000).toLocaleString("vi-VN")} ₫`,
  oldPrice: `${(2630000000 + i * 10000000).toLocaleString("vi-VN")} ₫`,
  userType: i % 2 === 0 ? "Cá nhân" : "Salon",
  postedTime: `${(i % 5) + 1} Ngày Trước`,
  location: ["Quận 1", "Quận 3", "Quận 5", "Quận 7", "Tân Bình"][i % 5],
}));

export default function SavedPostsPage() {
  const [currentPage, setCurrentPage] = useState(1);
  const [pageInput, setPageInput] = useState("");
  const postsPerPage = 6;
  const totalPages = Math.ceil(savedPosts.length / postsPerPage);
  const currentPosts = savedPosts.slice(
    (currentPage - 1) * postsPerPage,
    currentPage * postsPerPage
  );

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) setCurrentPage(page);
  };

  const handleGoToPage = () => {
    const page = parseInt(pageInput);
    if (!isNaN(page)) handlePageChange(page);
    setPageInput("");
  };

  return (
    <div className="bg-white rounded-2xl shadow-md border border-gray-100 p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-800">
          Tin đăng đã lưu{" "}
          <span className="text-green-600">({savedPosts.length})</span>
        </h2>
      </div>

      {/* Posts List */}
      <div className="flex flex-col gap-4">
        {currentPosts.map((post) => (
          <div
            key={post.id}
            className="flex items-center gap-4 bg-white border border-gray-200 rounded-xl p-3 hover:shadow-md transition-all"
          >
            {/* Image Section */}
            <div className="relative w-32 h-24 flex-shrink-0">
              <img
                src={post.image}
                alt={post.title}
                className="w-full h-full object-cover rounded-lg"
              />
              <span className="absolute top-1 left-1 bg-black/70 text-white text-xs px-1.5 py-0.5 rounded">
                {Math.floor(Math.random() * 15) + 1}
              </span>
            </div>

            {/* Info Section */}
            <div className="flex flex-col flex-1 min-w-0">
              <h3 className="text-base font-semibold text-gray-800 hover:text-green-600 truncate">
                {post.title}
              </h3>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-red-600 font-bold text-sm">
                  {post.price}
                </span>
                <span className="text-gray-400 line-through text-sm">
                  {post.oldPrice}
                </span>
              </div>
              <div className="text-xs text-gray-500 flex flex-wrap gap-1 mt-1">
                <span>{post.userType}</span>•
                <span>{post.postedTime}</span>•
                <span>{post.location}</span>
              </div>
            </div>

            {/* Actions Section */}
            <div className="flex flex-col items-center gap-2 min-w-[70px]">
              <button className="flex items-center gap-1 border border-green-600 text-green-600 rounded-full px-3 py-1 text-xs hover:bg-green-50 transition">
                <MessageCircle className="w-4 h-4" />
                Chat
              </button>
              <button className="text-red-500 hover:text-red-600 transition">
                <Heart className="w-5 h-5 fill-red-500" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Pagination */}
      <div className="flex justify-between items-center mt-8">
        <button
          className={`px-3 py-1.5 rounded-md font-medium ${
            currentPage === 1
              ? "text-gray-400 cursor-not-allowed"
              : "text-green-600 hover:bg-green-50 transition"
          }`}
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={currentPage === 1}
        >
          ← Trước
        </button>

        <div className="flex items-center gap-3">
          <span className="text-sm text-gray-600">
            Trang <strong>{currentPage}</strong> / {totalPages}
          </span>
          {totalPages > 4 && (
            <>
              <input
                type="number"
                placeholder="Tới..."
                value={pageInput}
                onChange={(e) => setPageInput(e.target.value)}
                className="w-20 border border-gray-200 rounded-md px-2 py-1 text-sm"
              />
              <button
                onClick={handleGoToPage}
                className="bg-green-600 text-white text-sm px-3 py-1 rounded-md hover:bg-green-700 transition-all"
              >
                Đi
              </button>
            </>
          )}
        </div>

        <button
          className={`px-3 py-1.5 rounded-md font-medium ${
            currentPage === totalPages
              ? "text-gray-400 cursor-not-allowed"
              : "text-green-600 hover:bg-green-50 transition"
          }`}
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
        >
          Tiếp →
        </button>
      </div>
    </div>
  );
}
