import { CanActivate, ExecutionContext, Injectable } from "@nestjs/common";
import { CustomSocket } from "../interface/custom-socket.interface";
import { WsException } from "@nestjs/websockets";
import { SessionService } from "src/module/session/session.service";

@Injectable()
export class WsSessionAuthGuard implements CanActivate {
    constructor(
        private readonly sessionService: SessionService
    ) {}

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const client = context.switchToWs().getClient<CustomSocket>();

        const sessionId = client.handshake.auth?.sessionId;

        if (typeof sessionId !== 'string' || !sessionId) {
            throw new WsException('세션이 없습니다.');
        }

        const session = await this.sessionService.findSessionById(sessionId);

        client.data.session = session;

        return true;
    }
}
