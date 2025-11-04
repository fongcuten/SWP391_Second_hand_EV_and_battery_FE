import React, { useState, useMemo } from "react";
import { Search } from "lucide-react";
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
        <div className="w-full lg:w-80 bg-white border-r flex flex-col">
            <div className="p-3 border-b flex items-center justify-between">
                <h1 className="text-lg font-semibold text-gray-900">Tin nhắn</h1>
                {wsConnected && (
                    <span className="text-xs text-green-600 flex items-center gap-1">
                        <span className="w-2 h-2 bg-green-600 rounded-full animate-pulse"></span>
                        Trực tuyến
                    </span>
                )}
            </div>

            <div className="p-3 border-b">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder="Tìm kiếm..."
                        className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                </div>
            </div>

            <div className="flex-1 overflow-y-auto">
                {loading ? (
                    <div className="p-6 text-center text-gray-500">Đang tải...</div>
                ) : filtered.length === 0 ? (
                    <div className="p-6 text-center text-gray-500">
                        {searchTerm ? "Không tìm thấy cuộc trò chuyện" : "Chưa có cuộc trò chuyện nào"}
                    </div>
                ) : (
                    filtered.map((conv) => (
                        <button
                            key={conv.conversationKey}
                            onClick={() => onSelect(conv.conversationKey)}
                            className={`w-full p-4 flex items-start gap-3 border-b hover:bg-gray-50 transition ${activeChatKey === conv.conversationKey ? "bg-blue-50" : ""
                                }`}
                        >
                            <div className="w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold flex-shrink-0">
                                {conv.otherUser.name.charAt(0).toUpperCase()}
                            </div>
                            <div className="flex-1 min-w-0 text-left">
                                <div className="flex justify-between items-center mb-1">
                                    <h3 className="font-semibold text-gray-900 truncate">
                                        {conv.otherUser.name}
                                    </h3>
                                    <span className="text-xs text-gray-500 flex-shrink-0">
                                        {formatTime(conv.lastMessage.sentAt)}
                                    </span>
                                </div>
                                <p className="text-sm text-gray-600 truncate">
                                    {conv.lastMessage.content || "Chưa có tin nhắn"}
                                </p>
                            </div>
                        </button>
                    ))
                )}
            </div>
        </div>
    );
};

export default React.memo(ChatSidebar);
