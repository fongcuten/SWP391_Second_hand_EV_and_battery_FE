import React, { useState, useRef } from "react";
import { Paperclip, Send, MoreVertical } from "lucide-react";

interface Message {
    id: number;
    text?: string;
    image?: string;
    sender: "me" | "them";
    time: string;
}

interface Chat {
    id: number;
    name: string;
    avatar?: string;
    messages: Message[];
    active?: boolean;
}

const ChatPage: React.FC = () => {
    const [chats, setChats] = useState<Chat[]>([
        {
            id: 1,
            name: "Dong Tien Dat",
            avatar: "https://ui-avatars.com/api/?name=Dong+Tien+Dat&background=random",
            active: true,
            messages: [
                {
                    id: 1,
                    text: "Chào bạn, xe còn không ạ?",
                    sender: "them",
                    time: "10:15",
                },
                {
                    id: 2,
                    text: "Mình quan tâm xe đó nhé!",
                    sender: "me",
                    time: "09:20",
                },
            ],
        },
        {
            id: 2,
            name: "Tran Quang Kiet",
            avatar: "https://ui-avatars.com/api/?name=Tran+Quang+Kiet&background=random",
            messages: [
                {
                    id: 1,
                    text: "Chào bạn, xe này bao nhiêu vậy?",
                    sender: "them",
                    time: "11:05",
                },
                {
                    id: 2,
                    text: "Xe mình bán 300 triệu nhé.",
                    sender: "me",
                    time: "11:07",
                },
            ],
        },
    ]);

    const [message, setMessage] = useState("");
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement | null>(null);

    const activeChat = chats.find((chat) => chat.active);

    const handleSend = () => {
        if (!activeChat || (!message.trim() && !imagePreview)) return;

        const newMessage: Message = {
            id: Date.now(),
            text: message.trim() || undefined,
            image: imagePreview || undefined,
            sender: "me",
            time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        };

        setChats((prev) =>
            prev.map((chat) =>
                chat.id === activeChat.id
                    ? { ...chat, messages: [...chat.messages, newMessage] }
                    : chat
            )
        );

        setMessage("");
        setImagePreview(null);
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (event) => setImagePreview(event.target?.result as string);
            reader.readAsDataURL(file);
        }
    };

    const handleChatSelect = (id: number) => {
        setChats((prev) =>
            prev.map((chat) => ({ ...chat, active: chat.id === id }))
        );
    };

    const handleDeleteChat = (id: number) => {
        setChats((prev) => prev.filter((chat) => chat.id !== id));
    };

    return (
        <div className="flex h-[600px] bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm">
            {/* Sidebar */}
            <div className="w-72 border-r border-gray-200 bg-gray-50">
                <div className="p-4 border-b border-gray-200 font-semibold text-[#2C3E50]">
                    Tin nhắn
                </div>
                <div className="overflow-y-auto h-full">
                    {chats.length === 0 ? (
                        <div className="text-gray-500 text-sm text-center mt-10">
                            Chưa có cuộc trò chuyện nào
                        </div>
                    ) : (
                        chats.map((chat) => (
                            <div
                                key={chat.id}
                                onClick={() => handleChatSelect(chat.id)}
                                className={`flex items-center gap-3 p-3 cursor-pointer border-b border-gray-100 ${chat.active ? "bg-white shadow-sm" : "hover:bg-gray-100"
                                    }`}
                            >
                                <img
                                    src={chat.avatar}
                                    alt={chat.name}
                                    className="w-10 h-10 rounded-full object-cover"
                                />
                                <div className="flex-1">
                                    <div className="text-sm font-medium text-[#2C3E50]">
                                        {chat.name}
                                    </div>
                                    <div className="text-xs text-gray-500 truncate">
                                        {chat.messages[chat.messages.length - 1]?.text ||
                                            "Hình ảnh"}
                                    </div>
                                </div>
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        handleDeleteChat(chat.id);
                                    }}
                                    className="text-gray-400 hover:text-red-500"
                                >
                                    <MoreVertical size={14} />
                                </button>
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* Chat Window */}
            <div className="flex-1 flex flex-col bg-gray-50">
                {activeChat ? (
                    <>
                        {/* Header */}
                        <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-200 bg-white">
                            <img
                                src={activeChat.avatar}
                                alt={activeChat.name}
                                className="w-10 h-10 rounded-full object-cover"
                            />
                            <div>
                                <div className="font-medium text-[#2C3E50]">{activeChat.name}</div>
                            </div>
                        </div>

                        {/* Messages */}
                        <div className="flex-1 overflow-y-auto p-4 space-y-4">
                            {activeChat.messages.map((msg) => (
                                <div
                                    key={msg.id}
                                    className={`flex ${msg.sender === "me" ? "justify-end" : "justify-start"
                                        }`}
                                >
                                    {msg.sender === "them" && (
                                        <img
                                            src={activeChat.avatar}
                                            alt=""
                                            className="w-8 h-8 rounded-full mr-2 mt-auto object-cover"
                                        />
                                    )}
                                    <div
                                        className={`max-w-xs px-3 py-2 rounded-2xl text-sm shadow ${msg.sender === "me"
                                                ? "bg-[#2ECC71] text-white rounded-br-none"
                                                : "bg-white text-gray-800 rounded-bl-none"
                                            }`}
                                    >
                                        {msg.image && (
                                            <img
                                                src={msg.image}
                                                alt="sent"
                                                className="rounded-lg mb-1 max-w-[200px]"
                                            />
                                        )}
                                        {msg.text && <p className="leading-snug">{msg.text}</p>}
                                        <p
                                            className={`text-[10px] mt-1 ${msg.sender === "me"
                                                    ? "text-white/80 text-right"
                                                    : "text-gray-400"
                                                }`}
                                        >
                                            {msg.time}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Image Preview */}
                        {imagePreview && (
                            <div className="px-4 pb-2">
                                <div className="relative inline-block">
                                    <img
                                        src={imagePreview}
                                        alt="preview"
                                        className="w-24 h-24 object-cover rounded-lg border"
                                    />
                                    <button
                                        onClick={() => setImagePreview(null)}
                                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 text-xs"
                                    >
                                        ✕
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* Input */}
                        <div className="p-3 bg-white border-t border-gray-200 flex items-center gap-2">
                            <button
                                onClick={() => fileInputRef.current?.click()}
                                className="text-gray-500 hover:text-[#2ECC71]"
                            >
                                <Paperclip size={18} />
                            </button>
                            <input
                                type="file"
                                accept="image/*"
                                ref={fileInputRef}
                                onChange={handleFileChange}
                                className="hidden"
                            />
                            <input
                                type="text"
                                placeholder="Viết tin nhắn..."
                                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#2ECC71]"
                                value={message}
                                onChange={(e) => setMessage(e.target.value)}
                                onKeyDown={(e) => e.key === "Enter" && handleSend()}
                            />
                            <button
                                onClick={handleSend}
                                className="bg-[#2ECC71] text-white p-2 rounded-lg hover:bg-[#27AE60]"
                            >
                                <Send size={16} />
                            </button>
                        </div>
                    </>
                ) : (
                    <div className="flex-1 flex items-center justify-center text-gray-500 text-sm">
                        Chọn một cuộc trò chuyện để bắt đầu
                    </div>
                )}
            </div>
        </div>
    );
};

export default ChatPage;
