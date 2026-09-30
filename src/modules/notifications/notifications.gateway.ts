import { Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Repository } from 'typeorm';
import { CONSTANTS } from 'src/common/constants/app.constants';
import { JwtServices } from 'src/modules/auth/strategies/jwt.strategies';
import { User } from 'src/modules/users/entities/user.entity';
import type { AuthenticatedSocket } from './interfaces/notification.interface';

@WebSocketGateway({
  namespace: CONSTANTS.SOCKET.NAMESPACE,
  cors: {
    origin: '*',
    credentials: true,
  },
})
export class NotificationsGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  private readonly logger = new Logger(NotificationsGateway.name);

  @WebSocketServer()
  server: Server;

  constructor(
    private readonly jwtService: JwtServices,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  // Auth happens here rather than a guard: a WS connection has no per-request
  // lifecycle, so the token is verified once at handshake and the resolved
  // user is cached on the socket for every subsequent event on it.
  async handleConnection(client: AuthenticatedSocket): Promise<void> {
    try {
      const token = this.extractToken(client);
      const decoded = this.jwtService.verifyAccessToken(token);

      const user = await this.userRepository.findOneBy({ id: decoded.id });
      if (!user?.refreshToken) {
        throw new Error('Unauthorized socket connection');
      }

      client.data.user = { id: user.id, role: user.role };

      await client.join(CONSTANTS.SOCKET.ROOMS.user(user.id));

      if (user.role === CONSTANTS.ROLES.ORGANIZER) {
        await client.join(CONSTANTS.SOCKET.ROOMS.organizerDashboard(user.id));
      }

      this.logger.log(`Socket connected: user=${user.id} socket=${client.id}`);
    } catch (error) {
      this.logger.warn(`Socket auth failed: ${(error as Error).message}`);
      client.emit(CONSTANTS.SOCKET.EVENTS.EXCEPTION, {
        message: 'Unauthorized',
      });
      client.disconnect(true);
    }
  }

  handleDisconnect(client: AuthenticatedSocket): void {
    this.logger.log(
      `Socket disconnected: user=${client.data?.user?.id} socket=${client.id}`,
    );
  }

  // Lets any connected client (attendee page or future organizer dashboard)
  // subscribe to live updates for a specific event without a page reload.
  @SubscribeMessage(CONSTANTS.SOCKET.EVENTS.JOIN_EVENT_ROOM)
  async onJoinEventRoom(
    client: AuthenticatedSocket,
    eventId: string,
  ): Promise<void> {
    await client.join(CONSTANTS.SOCKET.ROOMS.event(eventId));
  }

  @SubscribeMessage(CONSTANTS.SOCKET.EVENTS.LEAVE_EVENT_ROOM)
  async onLeaveEventRoom(
    client: AuthenticatedSocket,
    eventId: string,
  ): Promise<void> {
    await client.leave(CONSTANTS.SOCKET.ROOMS.event(eventId));
  }

  private extractToken(client: Socket): string {
    const authToken = client.handshake.auth?.token as string | undefined;
    const headerToken = client.handshake.headers?.authorization;

    const token =
      authToken ||
      (typeof headerToken === 'string' ? headerToken.split(' ')[1] : undefined);

    if (!token) {
      throw new Error('Missing token');
    }

    return token;
  }
}
