import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
  OnGatewayInit,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Logger } from '@nestjs/common';
import { Server, Socket } from 'socket.io';

export interface SupportMessage {
  id: string;
  sender: 'customer' | 'admin';
  text: string;
  timestamp: string;
}

export interface SupportSession {
  sessionId: string;
  customerSocketId: string;
  customerName: string;
  customerEmail?: string;
  status: 'waiting' | 'active' | 'closed';
  createdAt: string;
  messages: SupportMessage[];
}

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class EventsGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;

  private logger: Logger = new Logger('EventsGateway');
  private supportSessions = new Map<string, SupportSession>();

  afterInit(server: Server) {
    this.logger.log('WebSocket Gateway Initialized');
  }

  handleConnection(client: Socket) {
    this.logger.log(`Client Connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Client Disconnected: ${client.id}`);
  }

  emitNewOrder(order: any) {
    this.logger.log(`Broadcasting new_order event for Order #${order._id}`);
    if (this.server) {
      this.server.emit('new_order', {
        orderId: order._id,
        totalPrice: order.totalPrice,
        customerName: order.shippingInfo?.name || order.guestName || 'Valued Customer',
        itemCount: order.orderItems?.length || 1,
        createdAt: order.createdAt || new Date(),
      });
    }
  }

  /**
   * 1. Customer requests live human support
   */
  @SubscribeMessage('request_support')
  handleRequestSupport(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { customerName: string; customerEmail?: string; initialMessage?: string },
  ) {
    const sessionId = `session_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
    const roomName = `room_${sessionId}`;

    client.join(roomName);

    const initialMessages: SupportMessage[] = data.initialMessage
      ? [
          {
            id: `msg_${Date.now()}`,
            sender: 'customer',
            text: data.initialMessage,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          },
        ]
      : [];

    const session: SupportSession = {
      sessionId,
      customerSocketId: client.id,
      customerName: data.customerName || 'Shopper',
      customerEmail: data.customerEmail || 'Guest Customer',
      status: 'waiting',
      createdAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      messages: initialMessages,
    };

    this.supportSessions.set(sessionId, session);

    // Confirm session creation to customer
    client.emit('support_session_created', session);

    // Broadcast new support request event to all admin clients for toast alert
    this.server.emit('new_support_request', {
      sessionId: session.sessionId,
      customerName: session.customerName,
      customerEmail: session.customerEmail,
      createdAt: session.createdAt,
    });

    // Broadcast update to all admin clients
    this.server.emit('support_sessions_updated', Array.from(this.supportSessions.values()));

    this.logger.log(`Customer ${session.customerName} requested live support (Session: ${sessionId})`);
    return { success: true, sessionId };
  }

  /**
   * 2. Get all active support sessions for Admin dashboard
   */
  @SubscribeMessage('get_support_sessions')
  handleGetSupportSessions(@ConnectedSocket() client: Socket) {
    client.emit('support_sessions_updated', Array.from(this.supportSessions.values()));
  }

  /**
   * 3. Join a specific support room (Admin or Customer)
   */
  @SubscribeMessage('join_support_room')
  handleJoinSupportRoom(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { sessionId: string; role: 'admin' | 'customer' },
  ) {
    const session = this.supportSessions.get(data.sessionId);
    if (!session) return { success: false, message: 'Session not found' };

    const roomName = `room_${data.sessionId}`;
    client.join(roomName);

    if (data.role === 'admin' && session.status === 'waiting') {
      session.status = 'active';
      this.server.emit('support_sessions_updated', Array.from(this.supportSessions.values()));
      
      // Notify the customer that the admin has joined!
      this.server.to(roomName).emit('support_room_joined', session);
    }

    return { success: true };
  }

  /**
   * 4. Relay live support messages between customer and admin in private room
   */
  @SubscribeMessage('send_support_message')
  handleSendSupportMessage(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { sessionId: string; sender: 'customer' | 'admin'; text: string },
  ) {
    const session = this.supportSessions.get(data.sessionId);
    if (!session) return { success: false, message: 'Session not found' };

    const message: SupportMessage = {
      id: `msg_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
      sender: data.sender,
      text: data.text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    session.messages.push(message);

    const roomName = `room_${data.sessionId}`;
    // Broadcast message to everyone in private room
    this.server.to(roomName).emit('receive_support_message', {
      sessionId: data.sessionId,
      message,
    });

    // Notify admins of session list update
    this.server.emit('support_sessions_updated', Array.from(this.supportSessions.values()));

    return { success: true };
  }

  /**
   * 5. End live support session
   */
  @SubscribeMessage('end_support_session')
  handleEndSupportSession(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { sessionId: string },
  ) {
    const session = this.supportSessions.get(data.sessionId);
    if (session) {
      session.status = 'closed';
      const roomName = `room_${data.sessionId}`;

      this.server.to(roomName).emit('support_session_ended', {
        sessionId: data.sessionId,
        message: 'Live support chat session ended.',
      });

      this.supportSessions.delete(data.sessionId);
      this.server.emit('support_sessions_updated', Array.from(this.supportSessions.values()));
    }

    return { success: true };
  }
}
