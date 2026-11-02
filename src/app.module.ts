import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './module/auth/auth.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { APP_FILTER, APP_INTERCEPTOR } from '@nestjs/core';
import { GlobalResponseInterceptor } from './interceptor/global-response.interceptor';
import { RedisModule } from '@nestjs-modules/ioredis';
import { GlobalExceptionFilter } from './filter/global-exception.filter';
import { UserModule } from './module/user/user.module';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { FriendModule } from './module/friend/friend.module';
import { FriendRequestModule } from './module/friend-request/friend-request.module';
import { SessionModule } from './module/session/session.module';
import { UserStatusModule } from './module/user-status/user-status.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true
    }),
    RedisModule.forRootAsync({
      useFactory: (configService: ConfigService) => ({
        type: 'single',
        url: configService.getOrThrow<string>('REDIS_URL')
      }),
      inject: [ConfigService]
    }),
    ServeStaticModule.forRoot({
      rootPath: join(process.cwd(), 'uploads'),
      serveRoot: '/static'
    }),
    AuthModule,
    UserModule,
    FriendModule,
    FriendRequestModule,
    SessionModule,
    UserStatusModule
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_FILTER,
      useClass: GlobalExceptionFilter
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: GlobalResponseInterceptor
    }
  ],
})
export class AppModule {}
