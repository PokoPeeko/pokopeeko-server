import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import cookieParser from 'cookie-parser';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { LoggerMiddleware } from './middleware/logger.middleware';
import { ErrorValidationPipe } from './pipe/error-validation.pipe';
import session from 'express-session';
import { ConfigService } from '@nestjs/config';
import { USER_STATUS_SWAGGER_DESCRIPTION, USER_STATUS_SWAGGER_MODELS } from './module/user-status/user-status.swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const configService = app.get(ConfigService);

  app.use(LoggerMiddleware);
  
  app.use(cookieParser());
  
  app.use(
    session({
      secret: configService.getOrThrow<string>('SESSION_SECRET'),
      resave: true,
      saveUninitialized: false
    })
  );

  app.useGlobalPipes(new ErrorValidationPipe());

  app.setGlobalPrefix('api', {
    exclude: ['/']
  });

  const swaggerConfig = new DocumentBuilder()
    .setTitle('PokoPeeko API')
    .setDescription(`PokoPeeko 인증, 사용자 프로필, 친구 및 실시간 상태 공유 API입니다.\n\n${USER_STATUS_SWAGGER_DESCRIPTION}`)
    .setVersion('1.0.0')
    .addTag('App', '서버 기본 응답')
    .addTag('Auth', 'Apple 로그인과 디바이스별 세션 관리')
    .addTag('User', '사용자 프로필 관리')
    .addTag('Friend', '친구 검색과 관계 삭제')
    .addTag('FriendRequest', '친구 요청 전송·조회·취소·수락·거절')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description: 'Firebase Authentication ID Token'
      },
      'firebase'
    )
    .addApiKey(
      {
        type: 'apiKey',
        in: 'header',
        name: 'x-session-id',
        description: 'Session ID'
      },
      'session'
    )
    .build();

  const document = SwaggerModule.createDocument(app, swaggerConfig, {
    extraModels: USER_STATUS_SWAGGER_MODELS
  });
  SwaggerModule.setup('api-docs', app, document);

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
