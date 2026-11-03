import { Logger, OnModuleDestroy, UnauthorizedException, UseFilters, UseGuards } from '@nestjs/common';
import { ConnectedSocket, MessageBody, OnGatewayConnection, OnGatewayDisconnect, OnGatewayInit, SubscribeMessage, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { WsSessionAuthGuard } from '../auth/guard/ws-session-auth.guard';
import { GlobalExceptionFilter } from 'src/filter/global-exception.filter';
import { type CustomSocket } from '../auth/interface/custom-socket.interface';
import { Namespace } from 'socket.io';
import { SessionService } from '../session/session.service';
import { UserStatusService } from './user-status.service';
import { WindowStatusUpdateDto } from './dto/window-status-update.dto';
import { MusicStatusUpdateDto } from './dto/music-status-update.dto';

@WebSocketGateway({
  namespace: 'user-status',
  cors: {
    origin: '*'
  }
})
@UseGuards(WsSessionAuthGuard)
@UseFilters(GlobalExceptionFilter)
export class UserStatusGateway implements OnGatewayInit<Namespace>, OnGatewayConnection, OnGatewayDisconnect, OnModuleDestroy {
  constructor(
    private readonly sessionService: SessionService,
    private readonly userStatusService: UserStatusService
  ) {}
  private readonly logger = new Logger(UserStatusGateway.name);
  private sessionCheckTimer?: ReturnType<typeof setInterval>;
  private checkingSessions = false;

  @WebSocketServer()
  private server!: Namespace;

  @SubscribeMessage('user_status:heartbeat')
  async handleUserStatusHeartbeat(
    @ConnectedSocket() client: CustomSocket
  ): Promise<void> {
    await this.userStatusService.refreshStatusTtl(client.data.session.userId);
  }

  @SubscribeMessage('friends_status:get')
  async handleGetFriendsStatus(
    @ConnectedSocket() client: CustomSocket
  ) {
    const { userId } = client.data.session;

    const { friendsWindowStatus, friendsMusicStatus } = await this.userStatusService.getFriendsStatus(userId);

    for (const status of friendsWindowStatus) {
      client.emit('window_status:updated', status);
    }

    for (const status of friendsMusicStatus) {
      client.emit('music_status:updated', status);
    }
  }

  @SubscribeMessage('window_status:update')
  async handleWindowStatusUpdate(
    @MessageBody() payload: WindowStatusUpdateDto,
    @ConnectedSocket() client: CustomSocket
  ): Promise<void> {
    const { userId } = client.data.session;

    const { friendIds, updatedAt } = await this.userStatusService.windowStatusUpdate(payload, client);

    if (friendIds.length === 0) return;

    const rooms = friendIds.map(id => `user:${id}`);

    this.server.to(rooms).emit('window_status:updated', {
      userId,
      appTitle: payload.appTitle,
      taskDescription: payload.taskDescription,
      updatedAt
    });
  }

  @SubscribeMessage('music_status:update')
  async handleMusicStatusUpdate(
    @MessageBody() payload: MusicStatusUpdateDto,
    @ConnectedSocket() client: CustomSocket
  ): Promise<void> {
    const { userId } = client.data.session;

    const { friendIds, updatedAt } = await this.userStatusService.musicStatusUpdate(payload, client);

    if (friendIds.length === 0) return;

    const rooms = friendIds.map(id => `user:${id}`);

    this.server.to(rooms).emit('music_status:updated', {
      userId,
      artistName: payload.artistName,
      trackTitle: payload.trackTitle,
      updatedAt
    });
  }

  afterInit(server: Namespace) {
    server.use(async (client, next) => {
      const sessionId = client.handshake.auth?.sessionId;

      if (typeof sessionId !== 'string' || !sessionId) {
        return next(new Error('세션이 없습니다.'));
      }
      
      try {
        client.data.session = await this.sessionService.findSessionById(sessionId);
      } catch {
        return next(new Error('유효하지 않은 세션입니다.'));
      }

      next();
    });

    this.sessionCheckTimer = setInterval(() => {
      void this.checkConnectedSessions(server);
    }, 20_000);
    this.sessionCheckTimer.unref();
  }

  private async checkConnectedSessions(server: Namespace): Promise<void> {
    if (this.checkingSessions) return;
    this.checkingSessions = true;

    try {
      for (const client of server.sockets.values()) {
        try {
          const sessionId = client.handshake.auth?.sessionId;

          if (typeof sessionId !== 'string' || !sessionId) {
            throw new UnauthorizedException('세션이 없습니다.');
          }

          await this.sessionService.findSessionById(sessionId);
        } catch (error) {
          if (error instanceof UnauthorizedException) {
            client.emit('exception', {
              success: false,
              code: 'WS_ERROR',
              message: error.message,
            });
            client.disconnect();
          } else {
            this.logger.error(
              `SocketId: ${client.id} 세션 검사 중 오류 발생`,
              error instanceof Error ? error.stack : undefined,
            );
          }
        }
      }
    } finally {
      this.checkingSessions = false;
    }
  }

  onModuleDestroy(): void {
    if (this.sessionCheckTimer) {
      clearInterval(this.sessionCheckTimer);
      this.sessionCheckTimer = undefined;
    }
  }

  async handleConnection(client: CustomSocket) {
    const { userId } = client.data.session;

    await client.join(`user:${userId}`);

    await this.handleGetFriendsStatus(client);

    this.logger.log(`SocketId: ${client.id} UserId: ${client.data.session.userId} UserStatus Socket connected`);
  }

  async handleDisconnect(client: CustomSocket) {
    const { userId } = client.data.session;

    await client.leave(`user:${userId}`);

    const remainingSockets = await this.server.in(`user:${userId}`).fetchSockets();

    if (remainingSockets.length === 0) {
      const friendIds = await this.userStatusService.removeUserStatus(userId);

      if (friendIds.length > 0) {
        const rooms = friendIds.map(id => `user:${id}`);
        this.server.to(rooms).emit('user_status:removed', { userId });
      }
    }

    this.logger.log(`SocketId: ${client.id} UserId: ${client.data.session.userId} UserStatus Socket disconnected`);
  }
}
