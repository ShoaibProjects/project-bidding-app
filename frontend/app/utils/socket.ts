import { io, Socket } from 'socket.io-client';
import { Conversation, Message } from '@/app/types'; // Make sure to import your types

// Define a type for the data payload when a new conversation is created
interface NewConversationData {
  conversation: Conversation;
  participants: string[];
}

class SocketService {
  private socket: Socket | null = null;
  private static instance: SocketService;

  private constructor() {}

  public static getInstance(): SocketService {
    if (!SocketService.instance) {
      SocketService.instance = new SocketService();
    }
    return SocketService.instance;
  }

  public connect(serverUrl: string = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3001'): Socket {
    if (!this.socket) {
      this.socket = io(serverUrl, {
        transports: ['websocket', 'polling'],
        autoConnect: true,
      });

      this.socket.on('connect', () => {
        console.log('Connected to server:', this.socket?.id);
      });

      this.socket.on('disconnect', () => {
        console.log('Disconnected from server');
      });

      this.socket.on('connect_error', (error: Error) => {
        console.error('Connection error:', error);
      });
    }
    return this.socket;
  }

  public disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  public getSocket(): Socket | null {
    return this.socket;
  }

  // --- Chat-specific methods ---

  public joinConversation(conversationId: string): void {
    this.socket?.emit('join_conversation', conversationId);
  }

  public leaveConversation(conversationId: string): void {
    this.socket?.emit('leave_conversation', conversationId);
  }

  public sendMessage(conversationId: string, message: any): void {
    this.socket?.emit('send_message', { conversationId, message });
  }

  // --- Listener Methods with Type Safety ---

  public onReceiveMessage(callback: (data: { conversationId: string; message: Message }) => void): void {
    this.socket?.on('receive_message', callback);
  }

  /**
   * (MODIFIED) - Listens for newly created conversations for the user.
   */
  public onNewConversation(callback: (data: NewConversationData) => void): void {
    this.socket?.on('new_conversation_created', callback);
  }

  public onNewMessageNotification(callback: (data: any) => void): void {
    this.socket?.on('new_message_notification', callback);
  }
  
  public startTyping(conversationId: string, userId: string): void {
    this.socket?.emit('typing_start', { conversationId, userId });
  }

  public stopTyping(conversationId: string, userId: string): void {
    this.socket?.emit('typing_stop', { conversationId, userId });
  }

  public onUserTyping(callback: (data: any) => void): void {
    this.socket?.on('user_typing', callback);
  }

  public markMessagesAsRead(conversationId: string, userId: string): void {
    this.socket?.emit('mark_messages_read', { conversationId, userId });
  }

  public onMessagesRead(callback: (data: any) => void): void {
    this.socket?.on('messages_read', callback);
  }
  
  public setUserOnline(userId: string): void {
    this.socket?.emit('user_online', userId);
  }

  public onUserStatusChange(callback: (data: any) => void): void {
    this.socket?.on('user_status_change', callback);
  }

  // --- Cleanup Methods ---

  public removeAllListeners(): void {
    this.socket?.removeAllListeners();
  }

  public removeListener(event: string): void {
    this.socket?.off(event);
  }
}

export default SocketService.getInstance();