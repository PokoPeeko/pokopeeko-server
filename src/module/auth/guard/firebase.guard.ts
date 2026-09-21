import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from "@nestjs/common";
import { type Request } from "express";
import { cert, initializeApp } from "firebase-admin/app";
import { DecodedIdToken, getAuth } from 'firebase-admin/auth';

initializeApp({
  credential: cert({
    projectId: process.env.FIREBASE_PROJECT_ID,
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n')
  })
});

interface AuthenticatedRequest extends Request {
  user? : DecodedIdToken;
}

@Injectable()
export class FirebaseGuard implements CanActivate {
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();

    const authorization = request.headers.authorization;

    if (!authorization?.startsWith('Bearer ')) {
      throw new UnauthorizedException('토큰이 없습니다.');
    }

    const idToken = authorization.slice(7).trim();

    if (!idToken) {
      throw new UnauthorizedException('토큰이 없습니다.');
    }

    let decodedToken: DecodedIdToken;

    try {
      decodedToken = await getAuth().verifyIdToken(idToken);
    } catch {
      throw new UnauthorizedException('유효하지 않은 토큰입니다.');
    }

    if (decodedToken.firebase.sign_in_provider !== 'apple.com') {
      throw new UnauthorizedException('Apple 로그인 토큰이 아닙니다.');
    }

    const appleId = decodedToken.firebase.identities?.['apple.com']?.[0];

    if (!appleId) {
      throw new UnauthorizedException('Apple 사용자 식별자가 없습니다.');
    }

    request.user = decodedToken;

    return true;
  }
}
