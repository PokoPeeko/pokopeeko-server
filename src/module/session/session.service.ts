import { InjectRedis } from '@nestjs-modules/ioredis';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import Redis from 'ioredis';

@Injectable()
export class SessionService {
    constructor(@InjectRedis() private readonly redis: Redis) {}

    public async findSessionById(sessionId: string) {
        const rawSession = await this.redis.get(`session:${sessionId}`);

        if (!rawSession) {
            throw new UnauthorizedException('유효하지 않은 세션입니다.');
        }

        let session: unknown;

        try {
            session = JSON.parse(rawSession);
        } catch {
            throw new UnauthorizedException('유효하지 않은 세션입니다.');
        }

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

        return session;
    }
}
