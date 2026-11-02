import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from "@nestjs/common";
import { SessionService } from "src/module/session/session.service";

@Injectable()
export class SessionAuthGuard implements CanActivate {
  constructor(
    private readonly sessionService: SessionService
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const sessionId = request.headers['x-session-id'];

    if (typeof sessionId !== 'string' || !sessionId) {
      throw new UnauthorizedException('세션이 없습니다.');
    }

    const session = await this.sessionService.findSessionById(sessionId);

    request.user = {
      sessionId,
      ...session
    };

    return true;
  }
}
