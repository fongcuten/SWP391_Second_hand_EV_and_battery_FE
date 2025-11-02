import React, { useState, useEffect, useRef, useCallback } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
    Send,
    Paperclip,
    Search,
    MoreVertical,
    ArrowLeft,
    Phone,
    Video,
    Smile,
    CheckCheck,
} from "lucide-react";
import { toast } from "react-toastify";
import { ChatService, createConversationKey, type Conversation, type ChatMessage } from "../services/Chat/ChatService";
import { WebSocketService } from "../services/Chat/WebSocketService";
import { authService } from "../services/authService";

const ChatPage: React.FC = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const wsRef = useRef<WebSocketService | null>(null);
    const urlProcessedRef = useRef(false);

    const currentUser = authService.getCurrentUser();

    const [conversations, setConversations] = useState<Conversation[]>([]);
    const [activeChat, setActiveChat] = useState<Conversation | null>(null);
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [messageInput, setMessageInput] = useState("");
    const [searchTerm, setSearchTerm] = useState("");
    const [loading, setLoading] = useState(true);
    const [sending, setSending] = useState(false);
    const [wsConnected, setWsConnected] = useState(false);

    // ============================================
    // HELPER FUNCTIONS (useCallback)
    // ============================================
    const scrollToBottom = useCallback(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, []);

    const loadMessageHistory = useCallback(async (conversation: Conversation) => {
        console.log("📥 Loading message history for:", conversation.otherUser.name);
        setLoading(true);
        try {
            const history = await ChatService.getConversationHistory(
                conversation.otherUser.id
            );
            setMessages(history);
            console.log("✅ Loaded", history.length, "messages");
            setTimeout(() => scrollToBottom(), 100);
        } catch (error) {
            console.error("❌ Error loading message history:", error);
            toast.error("Không thể tải lịch sử chat");
            setMessages([]);
        } finally {
            setLoading(false);
        }
    }, [scrollToBottom]);

    const updateConversationLastMessage = useCallback((message: ChatMessage) => {
        const normalizedKey = createConversationKey(message.senderId, message.receiverId);

        setConversations((prev) => {
            const convIndex = prev.findIndex(c => c.conversationKey === normalizedKey);

            if (convIndex === -1) {
                return prev;
            }

            const conv = prev[convIndex];

            if (conv.lastMessage.content === message.content &&
                conv.lastMessage.sentAt === message.sentAt) {
                return prev;
            }

            const newConversations = [...prev];
            newConversations[convIndex] = {
                ...conv,
                lastMessage: {
                    content: message.content,
                    sentAt: message.sentAt,
                },
            };

            return newConversations;
        });
    }, []);

    // ============================================
    // LOAD CONVERSATIONS ON MOUNT
    // ============================================
    useEffect(() => {
        if (!currentUser) {
            toast.warning("Vui lòng đăng nhập để sử dụng chat");
            navigate("/login");
            return;
        }

        const loadConversations = async () => {
            setLoading(true);
            try {
                const data = await ChatService.getConversations();
                setConversations(data);
                console.log("✅ Loaded conversations:", data);
            } catch (error) {
                console.error("❌ Error loading conversations:", error);
                toast.error("Không thể tải danh sách chat");
            } finally {
                setLoading(false);
            }
        };

        loadConversations();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []); // Only run on mount

    // ============================================
    // CONNECT WEBSOCKET
    // ============================================
    useEffect(() => {
        const token = localStorage.getItem("auth_token");
        if (!token || !currentUser?.id) {
            console.warn("⚠️ Cannot connect WebSocket: missing token or user ID");
            return;
        }

        console.log("🔌 Initializing WebSocket for user:", currentUser.id);

        wsRef.current = new WebSocketService(token);

        wsRef.current.connect(
            (newMessage: ChatMessage) => {
                console.log("📨 New message:", newMessage);

                setMessages((prev) => {
                    const exists = prev.some(m =>
                        m.messageId === newMessage.messageId ||
                        (m.content === newMessage.content && m.sentAt === newMessage.sentAt)
                    );
                    return exists ? prev : [...prev, newMessage];
                });

                updateConversationLastMessage(newMessage);
            },
            () => {
                console.log("✅ WebSocket connected");
                setWsConnected(true);
                toast.success("Đã kết nối chat");
            },
            (error) => {
                console.error("❌ WebSocket error:", error);
                setWsConnected(false);
            }
        );

        return () => {
            console.log("🔌 Cleanup WebSocket");
            wsRef.current?.disconnect();
            wsRef.current = null;
        };
    }, [currentUser?.id, updateConversationLastMessage]);

    // ============================================
    // SELECT CONVERSATION (useCallback + Guard)
    // ============================================
    const handleSelectConversation = useCallback((conversation: Conversation) => {
        console.log("👆 Selecting conversation:", conversation.otherUser.name);

        setActiveChat(prevActiveChat => {
            if (prevActiveChat?.conversationKey === conversation.conversationKey) {
                console.log("⚠️ Already viewing this conversation");
                return prevActiveChat;
            }

            loadMessageHistory(conversation);
            return conversation;
        });
    }, [loadMessageHistory]);

    // ============================================
    // HANDLE URL PARAMS (Only run ONCE)
    // ============================================
    useEffect(() => {
        if (urlProcessedRef.current) {
            return;
        }

        const params = new URLSearchParams(location.search);
        const userId = params.get("userId");
        const userName = params.get("userName");

        if (!userId || !userName || !currentUser) return;

        console.log("🔗 Processing URL params:", { userId, userName });
        urlProcessedRef.current = true;

        const normalizedKey = createConversationKey(currentUser.id, userId);

        const existing = conversations.find(
            (c) => c.conversationKey === normalizedKey
        );

        if (existing) {
            console.log("✅ Found existing conversation");
            setActiveChat(existing);
            loadMessageHistory(existing);
        } else {
            console.log("➕ Creating new conversation");
            const newConversation: Conversation = {
                conversationKey: normalizedKey,
                otherUser: {
                    id: Number(userId),
                    name: decodeURIComponent(userName),
                    avatar: undefined,
                },
                lastMessage: {
                    content: "",
                    sentAt: new Date().toISOString(),
                },
                unreadCount: 0,
            };

            setActiveChat(newConversation);
            setMessages([]);
            setConversations((prev) => [newConversation, ...prev]);
        }

        navigate(location.pathname, { replace: true });

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [location.search]);

    // ============================================
    // SEND MESSAGE
    // ============================================
    const handleSendMessage = async (e?: React.FormEvent) => {
        e?.preventDefault();

        if (!activeChat || !messageInput.trim() || !currentUser || sending) {
            return;
        }

        const conversationKey = createConversationKey(currentUser.id, activeChat.otherUser.id);
        const messageCopy = messageInput.trim();

        const newMessage: ChatMessage = {
            senderId: Number(currentUser.id),
            receiverId: activeChat.otherUser.id,
            content: messageCopy,
            conversationKey,
            sentAt: new Date().toISOString(),
            messageType: "TEXT",
        };

        setMessageInput("");
        setMessages((prev) => [...prev, newMessage]);
        scrollToBottom();
        setSending(true);

        try {
            if (wsRef.current?.isConnected()) {
                wsRef.current.sendMessage(newMessage);
            } else {
                await ChatService.sendMessage(newMessage);
            }

            updateConversationLastMessage(newMessage);
        } catch (error) {
            console.error("❌ Error sending message:", error);
            toast.error("Không thể gửi tin nhắn");
            setMessageInput(messageCopy);
            setMessages((prev) => prev.filter((msg) => msg.sentAt !== newMessage.sentAt));
        } finally {
            setSending(false);
        }
    };

    // ============================================
    // HELPER FUNCTIONS
    // ============================================
    const formatTime = (timestamp: string) => {
        const date = new Date(timestamp);
        const now = new Date();
        const diff = now.getTime() - date.getTime();
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));

        if (days === 0) {
            return date.toLocaleTimeString("vi-VN", {
                hour: "2-digit",
                minute: "2-digit",
            });
        } else if (days === 1) {
            return "Hôm qua";
        } else if (days < 7) {
            return `${days} ngày trước`;
        } else {
            return date.toLocaleDateString("vi-VN");
        }
    };

    const filteredConversations = conversations.filter((conv) =>
        conv.otherUser.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (!currentUser) {
        return null;
    }

    // ============================================
    // RENDER
    // ============================================
    return (
        <div className="h-screen bg-gray-50 flex flex-col">
            {/* Header */}
            <div className="bg-white border-b px-4 py-3 flex items-center gap-3">
                <button
                    onClick={() => navigate(-1)}
                    className="lg:hidden p-2 hover:bg-gray-100 rounded-lg"
                >
                    <ArrowLeft className="w-5 h-5" />
                </button>
                <h1 className="text-xl font-bold text-gray-900">Tin nhắn</h1>
                {wsConnected && (
                    <span className="ml-auto text-xs text-green-600 flex items-center gap-1">
                        <span className="w-2 h-2 bg-green-600 rounded-full animate-pulse"></span>
                        Trực tuyến
                    </span>
                )}
            </div>

            <div className="flex-1 flex overflow-hidden">
                {/* Conversations List */}
                <div
                    className={`w-full lg:w-80 bg-white border-r flex flex-col ${activeChat ? "hidden lg:flex" : "flex"
                        }`}
                >
                    {/* Search */}
                    <div className="p-3 border-b">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Tìm kiếm..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                            />
                        </div>
                    </div>

                    {/* Conversation List */}
                    <div className="flex-1 overflow-y-auto">
                        {loading && conversations.length === 0 ? (
                            <div className="p-8 text-center text-gray-500">
                                Đang tải...
                            </div>
                        ) : filteredConversations.length === 0 ? (
                            <div className="p-8 text-center text-gray-500">
                                {searchTerm
                                    ? "Không tìm thấy cuộc trò chuyện"
                                    : "Chưa có cuộc trò chuyện nào"}
                            </div>
                        ) : (
                            filteredConversations.map((conv) => (
                                <button
                                    key={conv.conversationKey}
                                    onClick={() => handleSelectConversation(conv)}
                                    className={`w-full p-4 flex items-start gap-3 hover:bg-gray-50 transition border-b ${activeChat?.conversationKey === conv.conversationKey
                                        ? "bg-blue-50"
                                        : ""
                                        }`}
                                >
                                    <div className="w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center text-lg font-bold flex-shrink-0">
                                        {conv.otherUser.name.charAt(0).toUpperCase()}
                                    </div>
                                    <div className="flex-1 min-w-0 text-left">
                                        <div className="flex items-center justify-between mb-1">
                                            <h3 className="font-semibold text-gray-900 truncate">
                                                {conv.otherUser.name}
                                            </h3>
                                            <span className="text-xs text-gray-500">
                                                {formatTime(conv.lastMessage.sentAt)}
                                            </span>
                                        </div>
                                        <p className="text-sm text-gray-600 truncate">
                                            {conv.lastMessage.content || "Chưa có tin nhắn"}
                                        </p>
                                    </div>
                                    {conv.unreadCount && conv.unreadCount > 0 ? (
                                        <span className="bg-blue-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center flex-shrink-0">
                                            {conv.unreadCount}
                                        </span>
                                    ) : null}
                                </button>
                            ))
                        )}
                    </div>
                </div>

                {/* Chat Area */}
                <div
                    className={`flex-1 flex flex-col bg-white ${!activeChat ? "hidden lg:flex" : "flex"
                        }`}
                >
                    {activeChat ? (
                        <>
                            {/* Chat Header */}
                            <div className="px-4 py-3 border-b flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <button
                                        onClick={() => setActiveChat(null)}
                                        className="lg:hidden p-2 hover:bg-gray-100 rounded-lg"
                                    >
                                        <ArrowLeft className="w-5 h-5" />
                                    </button>
                                    <div className="w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold">
                                        {activeChat.otherUser.name.charAt(0).toUpperCase()}
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-gray-900">
                                            {activeChat.otherUser.name}
                                        </h3>
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
                                    <div className="text-center py-8 text-gray-500">
                                        Đang tải tin nhắn...
                                    </div>
                                ) : messages.length === 0 ? (
                                    <div className="text-center py-8 text-gray-500">
                                        Chưa có tin nhắn nào. Bắt đầu cuộc trò chuyện!
                                    </div>
                                ) : (
                                    messages.map((msg, index) => {
                                        const isOwn = msg.senderId === Number(currentUser.id);
                                        return (
                                            <div
                                                key={`${msg.messageId || index}-${msg.sentAt}`}
                                                className={`flex ${isOwn ? "justify-end" : "justify-start"}`}
                                            >
                                                <div
                                                    className={`max-w-[70%] rounded-2xl px-4 py-2 ${isOwn
                                                        ? "bg-blue-600 text-white"
                                                        : "bg-white text-gray-900"
                                                        } shadow-sm`}
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
                                <div ref={messagesEndRef} />
                            </div>

                            {/* Input */}
                            <form
                                onSubmit={handleSendMessage}
                                className="p-4 border-t bg-white"
                            >
                                <div className="flex items-center gap-2">
                                    <button
                                        type="button"
                                        className="p-2 hover:bg-gray-100 rounded-lg text-gray-600"
                                    >
                                        <Paperclip className="w-5 h-5" />
                                    </button>
                                    <input
                                        type="text"
                                        placeholder="Nhập tin nhắn..."
                                        value={messageInput}
                                        onChange={(e) => setMessageInput(e.target.value)}
                                        disabled={sending}
                                        className="flex-1 px-4 py-2 border border-gray-300 rounded-full focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none disabled:opacity-50"
                                    />
                                    <button
                                        type="button"
                                        className="p-2 hover:bg-gray-100 rounded-lg text-gray-600"
                                    >
                                        <Smile className="w-5 h-5" />
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={!messageInput.trim() || sending}
                                        className="p-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
                                    >
                                        <Send className="w-5 h-5" />
                                    </button>
                                </div>
                            </form>
                        </>
                    ) : (
                        <div className="flex-1 flex items-center justify-center text-gray-500">
                            <div className="text-center">
                                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <Send className="w-8 h-8 text-gray-400" />
                                </div>
                                <p className="text-lg font-medium">Chọn một cuộc trò chuyện</p>
                                <p className="text-sm text-gray-400 mt-1">
                                    Chọn từ danh sách bên trái để bắt đầu chat
                                </p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ChatPage;
