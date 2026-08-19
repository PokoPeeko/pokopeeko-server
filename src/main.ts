import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import cookieParser from 'cookie-parser';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { LoggerMiddleware } from './middleware/logger.middleware';
import { ErrorValidationPipe } from './pipe/error-validation.pipe';
import session from 'express-session';
import { ConfigService } from '@nestjs/config';

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
    .setTitle('Title Example')
    .setDescription('Description Example')
    .setVersion('1.0.0')
    .addTag('API Tag')
    .addBearerAuth(
      { type: 'http', bearerFormat: 'JWT' },
      'jwt'
    )
    .build();

  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('api-docs', app, document);

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
