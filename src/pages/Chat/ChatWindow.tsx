import React, { useState, useRef, useEffect } from "react";
import { Send, ArrowLeft, Phone, Video, MoreVertical, Paperclip, Smile, CheckCheck } from "lucide-react";
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

    // ✅ Add render counter
    const renderCountRef = useRef(0);
    renderCountRef.current++;

    // ✅ Log when messages prop changes
    useEffect(() => {
        console.log(`💬 ChatWindow render #${renderCountRef.current}`, {
            messagesCount: messages.length,
            activeChat: activeChat?.otherUser.name,
            lastMessage: messages[messages.length - 1]?.content,
        });
    }, [messages, messages.length, activeChat]);

    // ✅ Only scroll, no state updates
    useEffect(() => {
        endRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages.length]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (!messageInput.trim() || !activeChat) {
            return;
        }

        const msg: ChatMessage = {
            senderId: Number(currentUser.id), // ✅ Ensure it's a number
            receiverId: activeChat.otherUser.id,
            content: messageInput.trim(),
            conversationKey: activeChat.conversationKey,
            sentAt: new Date().toISOString(),
            messageType: "TEXT",
        };

        setMessageInput("");
        onSendMessage(msg);
    };

    const formatTime = (timestamp: string) => {
        const date = new Date(timestamp);
        return date.toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" });
    };

    if (!activeChat) {
        return (
            <div className="flex-1 hidden lg:flex items-center justify-center text-gray-500 bg-white">
                <div className="text-center">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Send className="w-8 h-8 text-gray-400" />
                    </div>
                    <p className="text-lg font-medium">Chọn một cuộc trò chuyện</p>
                    <p className="text-sm text-gray-400 mt-1">Chọn từ danh sách bên trái để bắt đầu chat</p>
                </div>
            </div>
        );
    }

    return (
        <div className="flex-1 flex flex-col bg-white">
            {/* Header */}
            <div className="px-4 py-3 border-b flex items-center justify-between flex-shrink-0">
                <div className="flex items-center gap-3">
                    <button onClick={onBack} className="lg:hidden p-2 hover:bg-gray-100 rounded-lg">
                        <ArrowLeft className="w-5 h-5" />
                    </button>
                    <div className="w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold">
                        {activeChat.otherUser.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                        <h3 className="font-semibold text-gray-900">{activeChat.otherUser.name}</h3>
                        <p className="text-xs text-gray-500">Đang hoạt động</p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <button className="p-2 hover:bg-gray-100 rounded-lg text-gray-600">
                        <Phone className="w-5 h-5" />
                    </button>
                    <button className="p-2 hover:bg-gray-100 rounded-lg text-gray-600">
                        <Video className="w-5 h-5" />
                    </button>
                    <button className="p-2 hover:bg-gray-100 rounded-lg text-gray-600">
                        <MoreVertical className="w-5 h-5" />
                    </button>
                </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
                {loading ? (
                    <div className="text-center py-8 text-gray-500">Đang tải tin nhắn...</div>
                ) : messages.length === 0 ? (
                    <div className="text-center py-12 text-gray-500">
                        Chưa có tin nhắn nào. Bắt đầu cuộc trò chuyện!
                    </div>
                ) : (
                    messages.map((msg, index) => {
                        // ✅ FIX: Convert both to numbers for comparison
                        const isOwn = Number(msg.senderId) === Number(currentUser.id);

                        // ✅ DEBUG (remove after testing)
                        if (index === 0) {
                            console.log("💬 Message alignment check:", {
                                msgSenderId: msg.senderId,
                                msgSenderIdType: typeof msg.senderId,
                                currentUserId: currentUser.id,
                                currentUserIdType: typeof currentUser.id,
                                isOwn,
                                numberComparison: Number(msg.senderId) === Number(currentUser.id)
                            });
                        }

                        return (
                            <div
                                key={`${msg.messageId || index}-${msg.sentAt}`}
                                className={`flex ${isOwn ? "justify-end" : "justify-start"}`}
                            >
                                <div
                                    className={`max-w-[70%] rounded-2xl px-4 py-2 shadow-sm ${isOwn
                                        ? "bg-blue-600 text-white"
                                        : "bg-white text-gray-900 border border-gray-200"
                                        }`}
                                >
                                    <p className="break-words">{msg.content}</p>
                                    <div
                                        className={`flex items-center gap-1 mt-1 text-xs ${isOwn ? "text-blue-100" : "text-gray-500"
                                            }`}
                                    >
                                        <span>{formatTime(msg.sentAt)}</span>
                                        {isOwn && <CheckCheck className="w-3 h-3" />}
                                    </div>
                                </div>
                            </div>
                        );
                    })
                )}
                <div ref={endRef} />
            </div>

            {/* Input */}
            <form onSubmit={handleSubmit} className="flex-shrink-0 p-4 border-t bg-white">
                <div className="flex items-center gap-2">
                    <button type="button" className="p-2 hover:bg-gray-100 rounded-lg text-gray-600 flex-shrink-0">
                        <Paperclip className="w-5 h-5" />
                    </button>
                    <input
                        type="text"
                        placeholder="Nhập tin nhắn..."
                        value={messageInput}
                        onChange={(e) => setMessageInput(e.target.value)}
                        className="flex-1 px-4 py-2 border border-gray-300 rounded-full focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                    />
                    <button type="button" className="p-2 hover:bg-gray-100 rounded-lg text-gray-600 flex-shrink-0">
                        <Smile className="w-5 h-5" />
                    </button>
                    <button
                        type="submit"
                        disabled={!messageInput.trim()}
                        className="p-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition flex-shrink-0"
                    >
                        <Send className="w-5 h-5" />
                    </button>
                </div>
            </form>
        </div>
    );
};

export default ChatWindow;
