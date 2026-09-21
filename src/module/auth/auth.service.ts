import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import prisma from 'src/database/prisma';
import { FindOrCreateUserRequestDto } from './dto/request/find-or-create-user-request.dto';
import { InjectRedis } from '@nestjs-modules/ioredis';
import type Redis from 'ioredis';
import { randomUUID } from 'node:crypto';
import { AppleLoginRequestDto } from './dto/request/apple-login-request.dto';
import { type DecodedIdToken } from 'firebase-admin/auth';

@Injectable()
export class AuthService {
  private readonly SESSION_TTL: number;

  constructor(
    @InjectRedis()
    private readonly redis: Redis,
    private readonly configService: ConfigService
  ) {
    this.SESSION_TTL = this.configService.getOrThrow<number>('SESSION_TTL');
  }

  private async findOrCreateUser(
    dto: FindOrCreateUserRequestDto
  ) {
    const existUser = await prisma.user.findFirst({
      where: {
        OR: [
          { firebaseUid: dto.firebaseUid },
          { appleId: dto.appleId }
        ]
      }
    });

    if (existUser) {
      if (existUser.firebaseUid !== dto.firebaseUid || existUser.appleId !== dto.appleId) {
        throw new UnauthorizedException('연결된 인증 계정 정보가 일치하지 않습니다.');
      }

      return existUser;
    }

    return prisma.user.create({
      data: dto
    });
  }

  private async createSession(
    userId: string,
    deviceId: string
  ) {
    const deviceSessionKey = `user:${userId}:device:${deviceId}:session`;

    const prevSessionId = await this.redis.get(deviceSessionKey);

    const sessionId = randomUUID();
    const sessionKey = `session:${sessionId}`;

    const pipeline = this.redis.multi();

    if (prevSessionId) {
      pipeline.del(`session:${prevSessionId}`);
    }

    pipeline.set(
      sessionKey,
      JSON.stringify({ userId, deviceId }),
      'EX',
      this.SESSION_TTL
    );

    pipeline.set(
      deviceSessionKey,
      sessionId,
      'EX',
      this.SESSION_TTL
    );

    await pipeline.exec();

    return sessionId;
  }

  public async appleLogin(
    user: DecodedIdToken,
    dto: AppleLoginRequestDto,
    deviceId: string
  ) {
    const firebaseUid = user.uid;
    const appleId = user.firebase.identities?.['apple.com']?.[0];
    const displayName = dto.displayName;
    const email = user.email;

    const findOrCreateUserDto: FindOrCreateUserRequestDto = {
      firebaseUid,
      appleId,
      displayName,
      email
    };

    const userAccount = await this.findOrCreateUser(findOrCreateUserDto);

    const sessionId = await this.createSession(userAccount.id, deviceId);

    return {
      sessionId
    };
  }
}
