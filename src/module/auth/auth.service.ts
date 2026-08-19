import { Injectable } from '@nestjs/common';

@Injectable()
export class AuthService {
  public async validateToken(
    refreshToken: string,
    user_id: number
  ) {
  }
}
