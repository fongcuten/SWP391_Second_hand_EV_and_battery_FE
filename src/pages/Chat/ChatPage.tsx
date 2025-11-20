import React, { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { toast } from "react-toastify";
import { ChatService, createConversationKey, type Conversation, type ChatMessage } from "../../services/Chat/ChatService";
import { WebSocketService } from "../../services/Chat/WebSocketService";
import { authService } from "../../services/authService";
import ChatSidebar from "./ChatSidebar";
import ChatWindow from "./ChatWindow";

const ChatPage: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const wsRef = useRef<WebSocketService | null>(null);
    const currentUser = authService.getCurrentUser();

    const handledNavStateRef = useRef(false);

    const [state, setState] = useState({
        conversations: [] as Conversation[],
        activeChatKey: null as string | null,
        messages: [] as ChatMessage[],
        loadingConversations: true,
        loadingMessages: false,
        wsConnected: false,
    });

    const activeChat = state.conversations.find(c => c.conversationKey === state.activeChatKey) || null;

    // ============================================
    // LOAD CONVERSATIONS - ONCE
    // ============================================
    useEffect(() => {
        if (!currentUser) {
            toast.warning("Vui lòng đăng nhập để sử dụng chat");
            navigate("/login");
            return;
        }

        let mounted = true;

        const loadConversations = async () => {
            try {
                const data = await ChatService.getConversations();
                if (mounted) {
                    setState(prev => ({
                        ...prev,
                        conversations: data,
                        loadingConversations: false
                    }));
                }
            } catch (error) {
                console.error("❌ Error loading conversations:", error);
                if (mounted) {
                    toast.error("Không thể tải danh sách chat");
                    setState(prev => ({ ...prev, loadingConversations: false }));
                }
            }
        };

        loadConversations();
        return () => { mounted = false; };
    }, [currentUser?.id, navigate]);

    // ============================================
    // ✅ WEBSOCKET - FIXED
    // ============================================
    useEffect(() => {
        const token = localStorage.getItem("auth_token");
        if (!token || !currentUser?.id) {
            return;
        }

        console.log("🔌 Connecting WebSocket...");

        wsRef.current = new WebSocketService(token);

        wsRef.current.connect(
            (newMessage: ChatMessage) => {
                console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
                console.log("📨 WebSocket message received!");
                console.log("📦 Content:", newMessage.content);
                console.log("📦 From:", newMessage.senderId);
                console.log("📦 To:", newMessage.receiverId);
                console.log("📦 Conv Key:", newMessage.conversationKey);
                console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");

                setState((prevState) => {
                    console.log("🔍 Before update:", {
                        messagesCount: prevState.messages.length,
                        activeChatKey: prevState.activeChatKey,
                    });


                    const messageConvKey = createConversationKey(
                        newMessage.senderId,
                        newMessage.receiverId
                    );

                    const isActiveConv = prevState.activeChatKey === messageConvKey;

                    console.log("🔍 Conv key comparison:", {
                        messageKey: messageConvKey,
                        activeKey: prevState.activeChatKey,
                        match: isActiveConv,
                    });

                    // ✅ FORCE NEW ARRAY
                    const newMessages = isActiveConv
                        ? [...prevState.messages, newMessage]
                        : prevState.messages;

                    console.log("🔍 After update:", {
                        oldCount: prevState.messages.length,
                        newCount: newMessages.length,
                        added: isActiveConv,
                    });

                    // Update conversations
                    const newConversations = prevState.conversations.map((conv) => {
                        if (conv.conversationKey === messageConvKey) {
                            return {
                                ...conv,
                                lastMessage: {
                                    content: newMessage.content,
                                    sentAt: newMessage.sentAt,
                                },
                                isTemporary: false,
                            };
                        }
                        return conv;
                    });

                    // Move to top if not active
                    if (!isActiveConv) {
                        const convIndex = newConversations.findIndex(
                            (c) => c.conversationKey === messageConvKey
                        );
                        if (convIndex > 0) {
                            const [conv] = newConversations.splice(convIndex, 1);
                            newConversations.unshift(conv);
                        }
                    }

                    console.log("✅ Returning new state");

                    return {
                        ...prevState,
                        messages: newMessages,
                        conversations: newConversations,
                    };
                });
            },
            () => {
                console.log("✅ WebSocket connected");
                setState((prev) => ({ ...prev, wsConnected: true }));
                toast.success("Đã kết nối chat");
            },
            (error) => {
                console.error("❌ WebSocket error:", error);
                setState((prev) => ({ ...prev, wsConnected: false }));
            }
        );

        return () => {
            console.log("🔌 Cleanup WebSocket");
            wsRef.current?.disconnect();
            wsRef.current = null;
        };
    }, [currentUser?.id]);

    // ============================================
    // LOAD MESSAGES
    // ============================================
    useEffect(() => {
        if (!state.activeChatKey) {
            setState(prev => ({ ...prev, messages: [] }));
            return;
        }

        if (!activeChat) return;

        let mounted = true;

        const loadMessages = async () => {
            setState(prev => ({ ...prev, loadingMessages: true }));

            try {
                const history = await ChatService.getConversationHistory(activeChat.otherUser.id);
                if (mounted) {
                    setState(prev => ({
                        ...prev,
                        messages: history,
                        loadingMessages: false
                    }));
                }
            } catch (error) {
                console.error("❌ Error loading messages:", error);
                if (mounted) {
                    if (!activeChat.isTemporary) {
                        toast.error("Không thể tải lịch sử chat");
                    }
                    setState(prev => ({
                        ...prev,
                        messages: [],
                        loadingMessages: false
                    }));
                }
            }
        };

        loadMessages();
        return () => { mounted = false; };
    }, [state.activeChatKey]);

    // ============================================
    // ✅ HANDLE NEW CHAT - FIXED (NO LOOP)
    // ============================================
    useEffect(() => {
        const navState = location.state as {
            sellerId?: number;
            sellerName?: string;
            productId?: number;
        } | null;

        // ✅ FIX: Only run once per navigation
        if (!navState?.sellerId || handledNavStateRef.current) {
            return;
        }

        handledNavStateRef.current = true;

        const handleNewChat = async () => {
            if (!currentUser) return;

            try {
                const conversationKey = await ChatService.createConversation(
                    Number(currentUser.id),
                    navState.sellerId!
                );

                setState(prev => {
                    const existingConv = prev.conversations.find(
                        c => c.conversationKey === conversationKey
                    );

                    if (existingConv) {
                        return { ...prev, activeChatKey: conversationKey };
                    }

                    const newConversation: Conversation = {
                        conversationKey,
                        otherUser: {
                            id: navState.sellerId!,
                            name: navState.sellerName!,
                        },
                        lastMessage: {
                            content: "",
                            sentAt: new Date().toISOString(),
                        },
                        unreadCount: 0,
                        isTemporary: true,
                    };

                    return {
                        ...prev,
                        conversations: [newConversation, ...prev.conversations],
                        activeChatKey: conversationKey,
                    };
                });

                window.history.replaceState({}, document.title);
                toast.success(`Bắt đầu chat với ${navState.sellerName}`);
            } catch (error) {
                console.error("❌ Error creating conversation:", error);
                toast.error("Không thể tạo cuộc trò chuyện");
            }
        };

        handleNewChat();
    }, [location.state?.sellerId]); // ✅ Only depend on sellerId

    // ✅ Reset ref when location changes
    useEffect(() => {
        handledNavStateRef.current = false;
    }, [location.pathname]);

    // ============================================
    // HANDLERS
    // ============================================
    const handleSelectConversation = useCallback((conversationKey: string) => {
        setState(prev => {
            if (prev.activeChatKey === conversationKey) return prev;
            return { ...prev, activeChatKey: conversationKey };
        });
    }, []);

    const handleSendMessage = useCallback(async (msg: ChatMessage) => {
        console.log("📤 Sending message to backend:", msg.content);

        // ❌ REMOVE THE OPTIMISTIC UPDATE
        // setState(prev => ({ ...prev, messages: [...prev.messages, msg] }));

        try {
            // ✅ Send to REST API (for saving) AND WebSocket (for broadcasting)
            // The REST call is now redundant if the WebSocket handler saves the message,
            // but we'll keep it for now as a fallback.
            if (wsRef.current?.isConnected()) {
                wsRef.current.sendMessage(msg);
                console.log("✅ Message sent via WebSocket for broadcast.");
            } else {
                toast.error("Không thể gửi tin nhắn. Mất kết nối chat.");
                return; // Don't update UI if not connected
            }

            // ✅ This part is still good - it updates the conversation list on the side
            const conversationKey = createConversationKey(msg.senderId, msg.receiverId);
            setState(prev => {
                const index = prev.conversations.findIndex(c => c.conversationKey === conversationKey);
                if (index === -1) return prev;

                const updated = [...prev.conversations];
                const convToUpdate = { ...updated[index] };

                convToUpdate.lastMessage = {
                    content: msg.content,
                    sentAt: msg.sentAt,
                };
                convToUpdate.isTemporary = false;

                // Move conversation to the top
                updated.splice(index, 1);
                updated.unshift(convToUpdate);

                return { ...prev, conversations: updated };
            });

        } catch (error) {
            console.error("❌ Send error:", error);
            toast.error("Không thể gửi tin nhắn");
            // Since we removed optimistic update, we don't need to revert state here.
        }
    }, []); // Keep dependencies empty

    const handleBack = useCallback(() => {
        setState(prev => ({ ...prev, activeChatKey: null }));
    }, []);

    if (!currentUser) {
        return null;
    }

    return (
        <div className="h-[86vh] bg-gray-100 flex flex-col overflow-hidden">
            <div className="flex-1 flex overflow-hidden min-h-0">
                {/* Sidebar */}
                <div
                    className={`
                        w-full lg:w-96 lg:flex-shrink-0
                        transition-all duration-300 ease-in-out
                        ${state.activeChatKey ? "hidden lg:flex" : "flex"}
                    `}
                >
                    <ChatSidebar
                        conversations={state.conversations}
                        activeChatKey={state.activeChatKey}
                        loading={state.loadingConversations}
                        onSelect={handleSelectConversation}
                        wsConnected={state.wsConnected}
                    />
                </div>

                {/* Chat Window */}
                <div
                    className={`
                        flex-1 flex flex-col h-full
                        transition-all duration-300 ease-in-out
                        ${state.activeChatKey ? "flex" : "hidden lg:flex"}
                    `}
                >
                    <ChatWindow
                        currentUser={currentUser}
                        activeChat={activeChat}
                        messages={state.messages}
                        onSendMessage={handleSendMessage}
                        onBack={handleBack}
                        loading={state.loadingMessages}
                    />
                </div>
            </div>
        </div>
    );
};

export default ChatPage;