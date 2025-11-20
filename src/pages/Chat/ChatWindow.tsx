import React, { useState, useRef, useEffect } from "react";
import { Send, ArrowLeft, Paperclip, CheckCheck, MessageSquare } from "lucide-react";
import type { Conversation, ChatMessage } from "../../services/Chat/ChatService";

interface Props {
    currentUser: any;
    activeChat: Conversation | null;
    messages: ChatMessage[];
    onSendMessage: (msg: ChatMessage) => void;
    onBack: () => void;
    loading?: boolean;
}

const ChatWindow: React.FC<Props> = ({
    currentUser,
    activeChat,
    messages,
    onSendMessage,
    onBack,
    loading = false,
}) => {
    const [messageInput, setMessageInput] = useState("");
    const endRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        endRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages.length]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!messageInput.trim() || !activeChat) return;

        const msg: ChatMessage = {
            senderId: Number(currentUser.id),
            receiverId: activeChat.otherUser.id,
            content: messageInput.trim(),
            conversationKey: activeChat.conversationKey,
            sentAt: new Date().toISOString(),
            messageType: "TEXT",
        };

        onSendMessage(msg);
        setMessageInput("");
    };

    const formatTime = (timestamp: string) => {
        const date = new Date(timestamp);
        return date.toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" });
    };

    if (!activeChat) {
        return (
            <div className="flex-1 hidden lg:flex items-center justify-center bg-gray-50 h-full">
                <div className="text-center text-gray-500">
                    <MessageSquare className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <p className="text-lg font-medium">Chọn một cuộc trò chuyện</p>
                    <p className="text-sm text-gray-400 mt-1">Chọn từ danh sách bên trái để bắt đầu chat</p>
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col bg-gray-50 h-full">
            {/* Header */}
            <div className="px-4 py-3 border-b border-gray-200 bg-white flex items-center justify-between flex-shrink-0">
                <div className="flex items-center gap-3">
                    <button onClick={onBack} className="lg:hidden p-2 -ml-2 text-gray-600 hover:bg-gray-100 rounded-full">
                        <ArrowLeft className="w-6 h-6" />
                    </button>
                    <div className="w-10 h-10 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-bold text-lg">
                        {activeChat.otherUser.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                        <h3 className="font-semibold text-gray-900">{activeChat.otherUser.name}</h3>
                    </div>
                </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-6 space-y-2">
                {loading ? (
                    <div className="text-center py-8 text-gray-500">Đang tải tin nhắn...</div>
                ) : messages.length === 0 ? (
                    <div className="text-center py-12 text-gray-500">
                        Chưa có tin nhắn nào. Bắt đầu cuộc trò chuyện!
                    </div>
                ) : (
                    messages.map((msg, index) => {
                        const isOwn = Number(msg.senderId) === Number(currentUser.id);
                        return (
                            <div
                                key={`${msg.messageId || index}-${msg.sentAt}`}
                                className={`flex items-end gap-2 ${isOwn ? "justify-end" : "justify-start"}`}
                            >
                                <div
                                    className={`max-w-[65%] rounded-2xl px-4 py-2.5 ${isOwn
                                        ? "bg-blue-600 text-white rounded-br-lg"
                                        : "bg-white text-gray-800 border border-gray-200 rounded-bl-lg"
                                        }`}
                                >
                                    <p className="break-words leading-snug">{msg.content}</p>
                                    <div
                                        className={`flex items-center gap-1.5 mt-1.5 text-xs ${isOwn ? "text-blue-200" : "text-gray-400"
                                            }`}
                                    >
                                        <span>{formatTime(msg.sentAt)}</span>
                                        {isOwn && <CheckCheck className="w-4 h-4" />}
                                    </div>
                                </div>
                            </div>
                        );
                    })
                )}
                <div ref={endRef} />
            </div>

            {/* Input */}
            <form onSubmit={handleSubmit} className="flex-shrink-0 p-4 border-t border-gray-200 bg-white">
                <div className="flex items-center gap-2">
                    <button type="button" className="p-2 text-gray-500 hover:text-blue-600 hover:bg-gray-100 rounded-full flex-shrink-0 transition">
                        <Paperclip className="w-5 h-5" />
                    </button>
                    <input
                        type="text"
                        placeholder="Nhập tin nhắn..."
                        value={messageInput}
                        onChange={(e) => setMessageInput(e.target.value)}
                        className="flex-1 px-4 py-2.5 border border-gray-300 bg-gray-100 rounded-full focus:ring-2 focus:ring-blue-500 focus:border-transparent focus:bg-white outline-none transition"
                    />
                    <button
                        type="submit"
                        disabled={!messageInput.trim()}
                        className="w-10 h-10 flex items-center justify-center bg-blue-600 text-white rounded-full hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition flex-shrink-0"
                    >
                        <Send className="w-5 h-5" />
                    </button>
                </div>
            </form>
        </div>
    );
};

export default ChatWindow;
