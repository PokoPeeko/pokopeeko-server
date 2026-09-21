import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { FirebaseGuard } from './guard/firebase.guard';

@Module({
  controllers: [AuthController],
  providers: [
    AuthService,
    FirebaseGuard
  ]
})
export class AuthModule {}
