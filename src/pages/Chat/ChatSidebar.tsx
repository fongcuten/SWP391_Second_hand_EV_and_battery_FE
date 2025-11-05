import React, { useState, useMemo } from "react";
import { Search, MessageSquare } from "lucide-react";
import type { Conversation } from "../../services/Chat/ChatService";

interface Props {
    conversations: Conversation[];
    activeChatKey: string | null;
    loading: boolean;
    wsConnected: boolean;
    onSelect: (conversationKey: string) => void;
}

const ChatSidebar: React.FC<Props> = ({
    conversations,
    activeChatKey,
    loading,
    wsConnected,
    onSelect,
}) => {
    const [searchTerm, setSearchTerm] = useState("");

    const filtered = useMemo(
        () =>
            conversations.filter((conv) =>
                conv.otherUser.name.toLowerCase().includes(searchTerm.toLowerCase())
            ),
        [conversations, searchTerm]
    );

    const formatTime = (timestamp: string) => {
        const date = new Date(timestamp);
        return date.toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" });
    };

    return (
        <div className="w-full bg-white border-r border-gray-200 flex flex-col">
            {/* Header */}
            <div className="p-4 border-b border-gray-200 flex items-center justify-between flex-shrink-0">
                <h1 className="text-xl font-bold text-gray-800">Tin nhắn</h1>
                <div className="flex items-center gap-2">
                    {wsConnected ? (
                        <span className="text-xs font-medium text-green-600 flex items-center gap-1.5">
                            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                            Trực tuyến
                        </span>
                    ) : (
                        <span className="text-xs font-medium text-gray-500 flex items-center gap-1.5">
                            <span className="w-2 h-2 bg-gray-400 rounded-full"></span>
                            Ngoại tuyến
                        </span>
                    )}
                </div>
            </div>

            {/* Search */}
            <div className="p-3 border-b border-gray-200 flex-shrink-0">
                <div className="relative">
                    <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder="Tìm kiếm cuộc trò chuyện..."
                        className="w-full pl-11 pr-4 py-2.5 border border-gray-300 bg-gray-50 rounded-full focus:ring-2 focus:ring-blue-500 focus:bg-white outline-none transition"
                    />
                </div>
            </div>

            {/* Conversation List */}
            <div className="flex-1 overflow-y-auto">
                {loading ? (
                    <div className="p-6 text-center text-gray-500">Đang tải danh sách...</div>
                ) : filtered.length === 0 ? (
                    <div className="p-10 text-center text-gray-500 flex flex-col items-center justify-center h-full">
                        <MessageSquare className="w-12 h-12 text-gray-300 mb-4" />
                        <p className="font-medium">
                            {searchTerm ? "Không tìm thấy" : "Chưa có cuộc trò chuyện"}
                        </p>
                        <p className="text-sm text-gray-400 mt-1">
                            {searchTerm ? "Thử từ khóa khác" : "Bắt đầu chat để xem tại đây"}
                        </p>
                    </div>
                ) : (
                    <ul className="divide-y divide-gray-200">
                        {filtered.map((conv) => (
                            <li key={conv.conversationKey}>
                                <button
                                    onClick={() => onSelect(conv.conversationKey)}
                                    className={`w-full p-4 flex items-center gap-4 text-left transition duration-200 relative ${activeChatKey === conv.conversationKey
                                            ? "bg-blue-50"
                                            : "hover:bg-gray-50"
                                        }`}
                                >
                                    {activeChatKey === conv.conversationKey && (
                                        <div className="absolute left-0 top-0 bottom-0 w-1 bg-blue-600 rounded-r-full"></div>
                                    )}
                                    <div className="relative flex-shrink-0">
                                        <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-bold text-xl">
                                            {conv.otherUser.name.charAt(0).toUpperCase()}
                                        </div>
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex justify-between items-center mb-0.5">
                                            <h3 className="font-semibold text-gray-800 truncate">
                                                {conv.otherUser.name}
                                            </h3>
                                            <span className="text-xs text-gray-500 flex-shrink-0 ml-2">
                                                {formatTime(conv.lastMessage.sentAt)}
                                            </span>
                                        </div>
                                        <p className="text-sm text-gray-500 truncate">
                                            {conv.lastMessage.content || "Chưa có tin nhắn"}
                                        </p>
                                    </div>
                                </button>
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </div>
    );
};

export default React.memo(ChatSidebar);
