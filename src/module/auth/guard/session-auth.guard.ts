import { InjectRedis } from "@nestjs-modules/ioredis";
import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from "@nestjs/common";
import Redis from "ioredis";

@Injectable()
export class SessionAuthGuard implements CanActivate {
  constructor(
    @InjectRedis()
    private readonly redis: Redis
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const sessionId = request.headers['x-session-id'];

    if (!sessionId) {
      throw new UnauthorizedException('세션이 없습니다.');
    }

    const rawSession = await this.redis.get(`session:${sessionId}`);

    if (!rawSession) {
      throw new UnauthorizedException('유효하지 않은 세션입니다.');
    }

    const session = JSON.parse(rawSession) as unknown;

    if (
      typeof session !== 'object' || session === null ||
      !('userId' in session) || typeof session.userId !== 'string' ||
      !('deviceId' in session) || typeof session.deviceId !== 'string'
    ) {
      throw new UnauthorizedException('유효하지 않은 세션입니다.');
    }

    const deviceSessionKey = `user:${session.userId}:device:${session.deviceId}:session`;

    const currentSessionId = await this.redis.get(deviceSessionKey);

    if (currentSessionId !== sessionId) {
      throw new UnauthorizedException('교체된 세션입니다.');
    }

    request.user = {
      sessionId,
      ...session
    };

    return true;
  }
}
