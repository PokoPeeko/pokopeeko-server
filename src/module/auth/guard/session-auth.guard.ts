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

    const session = JSON.parse(rawSession);

    request.user = session;

    return true;
  }
}
