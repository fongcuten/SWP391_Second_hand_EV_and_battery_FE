// services/Chat/WebSocketService.ts
import { Client } from "@stomp/stompjs";
import SockJS from "sockjs-client";
import { type ChatMessage } from "./ChatService";

export class WebSocketService {
    private client: Client | null = null;
    private token: string;
    private isConnecting: boolean = false;

    constructor(token: string) {
        this.token = token;
    }

    connect(
        onMessageReceived: (message: ChatMessage) => void,
        onConnected?: () => void,
        onError?: (error: any) => void
    ): void {
        if (this.isConnecting || this.client?.connected) {
            console.log("⚠️ WebSocket already connecting or connected");
            return;
        }

        this.isConnecting = true;

        try {
            console.log("🔌 Connecting via SockJS...");

            this.client = new Client({
                webSocketFactory: () => {
                    return new SockJS(`http://localhost:8080/evplatform/ws-chat?token=${this.token}`);
                },

                connectHeaders: {
                    Authorization: `Bearer ${this.token}`,
                },

                reconnectDelay: 5000,
                heartbeatIncoming: 10000,
                heartbeatOutgoing: 10000,

                debug: (str) => {
                    console.log("🔍 STOMP:", str);
                },

                onConnect: (frame) => {
                    console.log("✅ WebSocket connected via SockJS!");
                    this.isConnecting = false;

                    // Subscribe to personal message queue
                    this.client?.subscribe("/user/queue/messages", (message) => {
                        console.log("📨 Received WebSocket message:", message.body);
                        try {
                            const data = JSON.parse(message.body);

                            // ✅ Transform backend format to frontend format
                            const chatMessage: ChatMessage = {
                                messageId: data.messageId,
                                senderId: data.senderId,
                                senderName: data.senderName,
                                receiverId: data.receiverId,
                                receiverName: data.receiverName,
                                content: data.body, // ✅ Map 'body' to 'content'
                                conversationKey: data.conversationKey,
                                sentAt: data.sentAt,
                                messageType: "TEXT",
                            };

                            onMessageReceived(chatMessage);
                        } catch (error) {
                            console.error("❌ Error parsing message:", error);
                        }
                    });

                    onConnected?.();
                },

                onStompError: (frame) => {
                    console.error("❌ STOMP error:", frame);
                    this.isConnecting = false;
                    onError?.(frame);
                },

                onWebSocketError: (event) => {
                    console.error("❌ WebSocket error:", event);
                    this.isConnecting = false;
                    onError?.(event);
                },

                onWebSocketClose: (event) => {
                    console.log(
                        `🔌 WebSocket closed: Code ${event.code}, Reason: ${event.reason}`
                    );
                    this.isConnecting = false;
                },

                onDisconnect: () => {
                    console.log("🔌 WebSocket disconnected");
                    this.isConnecting = false;
                },
            });

            this.client.activate();
        } catch (error) {
            console.error("❌ Error creating WebSocket connection:", error);
            this.isConnecting = false;
            onError?.(error);
        }
    }

    sendMessage(message: ChatMessage): void {
        if (!this.client?.connected) {
            console.error("❌ WebSocket not connected");
            throw new Error("WebSocket not connected");
        }

        try {
            console.log("📤 Sending message via WebSocket:", message);

            // ✅ Send in backend's expected format
            this.client.publish({
                destination: "/app/chat.send",
                body: JSON.stringify({
                    senderId: message.senderId,
                    receiverId: message.receiverId,
                    body: message.content, // ✅ Send as 'body'
                    conversationKey: message.conversationKey,
                }),
            });

            console.log("✅ Message sent via WebSocket");
        } catch (error) {
            console.error("❌ Error sending message:", error);
            throw error;
        }
    }

    isConnected(): boolean {
        return this.client?.connected ?? false;
    }

    disconnect(): void {
        if (this.client) {
            console.log("🔌 Disconnecting WebSocket...");
            this.client.deactivate();
            this.client = null;
            this.isConnecting = false;
        }
    }
}

export default WebSocketService;