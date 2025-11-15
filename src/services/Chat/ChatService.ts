import api from "../../config/axios";

export interface Conversation {
    conversationKey: string;
    otherUser: {
        id: number;
        name: string;
        avatar?: string;
    };
    lastMessage: {
        content: string;
        sentAt: string;
    };
    unreadCount?: number;
    isTemporary?: boolean; // ✅ NEW: Mark temporary conversations
}

export interface ChatMessage {
    messageId?: number;
    senderId: number;
    senderName?: string;
    receiverId: number;
    receiverName?: string;
    content: string;
    conversationKey: string;
    sentAt: string;
    messageType?: "TEXT" | "IMAGE";
}

// ✅ Response for /api/messages/conversations/{userId}
interface ConversationListResponse {
    code: number;
    message: string;
    result: {
        partnerId: number;
        partnerName: string;
        lastMessage: string;
        lastMessageSenderName: string;
        sentAt: string;
    }[];
}

// ✅ Response for /api/messages/conversations (get messages between 2 users)
interface MessageHistoryResponse {
    code: number;
    message: string;
    result: {
        messageId: number;
        senderId: number;
        senderName: string;
        receiverId: number;
        receiverName: string;
        body: string;
        sentAt: string;
        conversationKey: string;
    }[];
}

// ✅ Response for POST /api/messages
interface SendMessageResponse {
    code: number;
    message: string;
    result: {
        messageId: number;
        senderId: number;
        senderName: string;
        receiverId: number;
        receiverName: string;
        body: string;
        sentAt: string;
        conversationKey: string;
    };
}

// Add this interface at the top with other interfaces
interface CreateConversationResponse {
    code: number;
    message: string;
    result: {
        conversationKey: string;
        user1Id: number;
        user2Id: number;
        createdAt: string;
    };
}

const createConversationKey = (userId1: number | string, userId2: number | string): string => {
    const id1 = String(userId1);
    const id2 = String(userId2);
    return id1 < id2 ? `${id1}_${id2}` : `${id2}_${id1}`;
};

class ChatServiceClass {
    /**
     * Get all conversations for current user
     * GET /api/messages/conversations/{userId}
     */
    getConversations = async (): Promise<Conversation[]> => {
        try {
            const currentUser = JSON.parse(localStorage.getItem("current_user") || "{}");
            const currentUserId = currentUser.id;

            if (!currentUserId) {
                throw new Error("Current user ID not found");
            }

            console.log("📤 Fetching conversations for user:", currentUserId);

            // ✅ Correct endpoint - needs userId parameter
            const response = await api.get<ConversationListResponse>(
                `/api/messages/conversations/${currentUserId}`
            );

            console.log("📦 Raw conversations from API:", response.data);

            if (response.data.code !== 1000 && response.data.code !== 0) {
                throw new Error(response.data.message || "Failed to load conversations");
            }

            // ✅ Transform to Conversation format
            const conversations: Conversation[] = response.data.result.map((conv) => {
                const conversationKey = createConversationKey(currentUserId, conv.partnerId);

                return {
                    conversationKey,
                    otherUser: {
                        id: conv.partnerId,
                        name: conv.partnerName,
                        avatar: undefined,
                    },
                    lastMessage: {
                        content: conv.lastMessage,
                        sentAt: conv.sentAt,
                    },
                    unreadCount: 0,
                    isTemporary: false, // Default to false for regular conversations
                };
            });

            // ✅ Sort by most recent message
            conversations.sort((a, b) => {
                return new Date(b.lastMessage.sentAt).getTime() - new Date(a.lastMessage.sentAt).getTime();
            });

            console.log("✅ Processed conversations:", conversations);

            return conversations;
        } catch (error: any) {
            console.error("❌ Error loading conversations:", error);

            if (error.response?.status === 404) {
                console.warn("⚠️ No conversations found");
                return [];
            }

            throw error;
        }
    };

    /**
     * Get message history between two users
     * GET /api/messages/conversations?user1Id={id1}&user2Id={id2}
     */
    getConversationHistory = async (otherUserId: number): Promise<ChatMessage[]> => {
        try {
            if (!otherUserId || isNaN(otherUserId)) {
                throw new Error(`Invalid user ID: ${otherUserId}`);
            }

            const currentUser = JSON.parse(localStorage.getItem("current_user") || "{}");
            const currentUserId = currentUser.id;

            if (!currentUserId) {
                throw new Error("Current user ID not found");
            }

            console.log("📤 Fetching conversation history between:", { currentUserId, otherUserId });

            // ✅ Correct endpoint - needs both user IDs as query params
            const response = await api.get<MessageHistoryResponse>(
                `/api/messages/conversation`,
                {
                    params: {
                        user1Id: currentUserId,
                        user2Id: otherUserId,
                    },
                }
            );

            console.log("📦 Raw message history:", response.data);

            if (response.data.code !== 1000 && response.data.code !== 0) {
                throw new Error(response.data.message || "Failed to load message history");
            }

            // ✅ Map backend response to frontend format
            const messages: ChatMessage[] = response.data.result.map((msg) => ({
                messageId: msg.messageId,
                senderId: msg.senderId,
                senderName: msg.senderName,
                receiverId: msg.receiverId,
                receiverName: msg.receiverName,
                content: msg.body, // ✅ Map 'body' to 'content'
                conversationKey: msg.conversationKey,
                sentAt: msg.sentAt,
                messageType: "TEXT",
            }));

            // ✅ Sort by sent time (oldest first for chat display)
            messages.sort((a, b) => {
                return new Date(a.sentAt).getTime() - new Date(b.sentAt).getTime();
            });

            console.log("✅ Processed messages:", messages);

            return messages;
        } catch (error: any) {
            console.error("❌ Error loading conversation history:", error);

            if (error.response?.status === 404) {
                console.warn("⚠️ No messages found, returning empty array");
                return [];
            }

            throw error;
        }
    };

    /**
     * Send message via REST API (fallback when WebSocket fails)
     * POST /api/messages
     */
    sendMessage = async (message: ChatMessage): Promise<ChatMessage> => {
        console.log("🔍 ============ SEND MESSAGE DEBUG ============");
        console.log("📤 Sending message via REST API");
        console.log("📦 Input message object:", {
            senderId: message.senderId,
            receiverId: message.receiverId,
            content: message.content,
            conversationKey: message.conversationKey,
            sentAt: message.sentAt,
        });

        try {
            const payload = {
                senderId: message.senderId,
                receiverId: message.receiverId,
                body: message.content,
            };

            console.log("📤 Request payload:", JSON.stringify(payload, null, 2));
            console.log("🌐 Endpoint: POST /api/messages");

            const response = await api.post<SendMessageResponse>("/api/messages", payload);

            console.log("✅ Response received:", {
                status: response.status,
                code: response.data.code,
                message: response.data.message,
            });

            console.log("📨 Full response data:", JSON.stringify(response.data, null, 2));

            if (response.data.code !== 1000 && response.data.code !== 0) {
                console.error("❌ API returned error code:", response.data.code);
                throw new Error(response.data.message || "Failed to send message");
            }

            const sentMessage: ChatMessage = {
                messageId: response.data.result.messageId,
                senderId: response.data.result.senderId,
                senderName: response.data.result.senderName,
                receiverId: response.data.result.receiverId,
                receiverName: response.data.result.receiverName,
                content: response.data.result.body,
                conversationKey: response.data.result.conversationKey,
                sentAt: response.data.result.sentAt,
                messageType: "TEXT",
            };

            console.log("✅ Processed sent message:", sentMessage);
            console.log("🔍 ============ END SEND MESSAGE DEBUG ============");

            return sentMessage;
        } catch (error: any) {
            console.error("❌ ============ SEND MESSAGE ERROR ============");
            console.error("❌ Error type:", error.constructor?.name);
            console.error("❌ Error message:", error.message);

            if (error.response) {
                console.error("❌ HTTP Response Error:", {
                    status: error.response.status,
                    statusText: error.response.statusText,
                    data: error.response.data,
                });
            }

            if (error.config) {
                console.error("❌ Request config:", {
                    url: error.config.url,
                    method: error.config.method,
                    data: error.config.data,
                });
            }

            console.error("🔍 ============ END ERROR ============");
            throw error;
        }
    };

    /**
     * Get all messages for a specific user
     * GET /api/messages/user/{userId}
     */
    getUserMessages = async (userId: number): Promise<ChatMessage[]> => {
        try {
            const response = await api.get<MessageHistoryResponse>(
                `/api/messages/user/${userId}`
            );

            if (response.data.code !== 1000 && response.data.code !== 0) {
                throw new Error(response.data.message || "Failed to load user messages");
            }

            return response.data.result.map((msg) => ({
                messageId: msg.messageId,
                senderId: msg.senderId,
                senderName: msg.senderName,
                receiverId: msg.receiverId,
                receiverName: msg.receiverName,
                content: msg.body, // ✅ Map 'body' to 'content'
                conversationKey: msg.conversationKey,
                sentAt: msg.sentAt,
                messageType: "TEXT",
            }));
        } catch (error: any) {
            console.error("❌ Error loading user messages:", error);
            throw error;
        }
    };

    /**
     * ✅ NEW: Create a temporary conversation for new chats
     */
    createTemporaryConversation(
        currentUserId: string | number,
        otherUserId: number,
        otherUserName: string
    ): Conversation {
        const conversationKey = createConversationKey(
            currentUserId,
            String(otherUserId)
        );

        return {
            conversationKey,
            otherUser: {
                id: otherUserId,
                name: otherUserName,
                avatar: undefined,
            },
            lastMessage: {
                content: "",
                sentAt: new Date().toISOString(),
            },
            unreadCount: 0,
            isTemporary: true, // ✅ Mark as temporary
        };
    }

    /**
     * ✅ NEW: Create a new conversation between two users
     * POST /api/messages/conversation
     */
    createConversation = async (senderId: number, receiverId: number): Promise<string> => {
        try {
            console.log("📤 Creating conversation between:", { senderId, receiverId });

            const response = await api.post<CreateConversationResponse>(
                "/api/messages/conversation",
                null,
                 // No request body needed
                {
                    params: {
                        senderId,
                        receiverId,
                    },
                }
            );

            console.log("📦 Create conversation response:", response.data);

            if (response.data.code !== 1000 && response.data.code !== 0) {
                throw new Error(response.data.message || "Failed to create conversation");
            }

            const conversationKey = response.data.result.conversationKey;
            console.log("✅ Conversation created:", conversationKey);

            return conversationKey;
        } catch (error: any) {
            console.error("❌ Error creating conversation:", error);

            // If conversation already exists, backend might return it
            if (error.response?.status === 409) {
                console.warn("⚠️ Conversation already exists");
                return createConversationKey(senderId, receiverId);
            }

            throw error;
        }
    };
}

export const ChatService = new ChatServiceClass();
export { createConversationKey };