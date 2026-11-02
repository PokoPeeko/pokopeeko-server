import { Body, Controller, ParseUUIDPipe, Post, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AppleLoginResponseDto } from './dto/response/apple-login-response.dto';
import { DeviceId } from 'src/common/decorator/device-id.decorator';
import { FirebaseGuard } from './guard/firebase.guard';
import { GetUser } from 'src/common/decorator/get-user.decorator';
import { AppleLoginRequestDto } from './dto/request/apple-login-request.dto';
import { type DecodedIdToken } from 'firebase-admin/auth';
import { ApiBadRequestResponse, ApiBearerAuth, ApiCreatedResponse, ApiHeader, ApiInternalServerErrorResponse, ApiOperation, ApiSecurity, ApiTags, ApiUnauthorizedResponse } from '@nestjs/swagger';
import { SessionAuthGuard } from './guard/session-auth.guard';
import { type SessionPayload } from './interface/session-payload.interface';
import { LogoutResponseDto } from './dto/response/logout-response.dto';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @UseGuards(FirebaseGuard)
  @Post('/login/apple')
  @ApiOperation({
    summary: 'Apple 로그인',
    description: 'Firebase에서 발급받은 Apple 로그인 ID 토큰을 검증한 뒤 사용자를 조회하거나 생성하고, 디바이스별 세션을 발급합니다. Authorization 헤더에는 Bearer 형식의 Firebase ID 토큰을, x-device-id 헤더에는 디바이스 UUID를 전달해야 합니다.'
  })
  @ApiCreatedResponse({
    description: '로그인 성공 및 세션 발급 완료',
    type: AppleLoginResponseDto
  })
  @ApiBadRequestResponse({
    description: '요청 본문 또는 x-device-id 형식이 올바르지 않음'
  })
  @ApiUnauthorizedResponse({
    description: '토큰이 없거나 유효하지 않음, Apple 로그인 토큰이 아님, 또는 연결된 인증 계정 정보가 일치하지 않음'
  })
  @ApiInternalServerErrorResponse({
    description: '로그인 처리 중 서버 오류 발생'
  })
  @ApiHeader({
    name: 'x-device-id',
    description: '디바이스 UUID',
    required: true,
    schema: {
      type: 'string',
      format: 'uuid',
      example: '550e8400-e29b-41d4-a716-446655440000'
    }
  })
  @ApiBearerAuth('firebase')
  public async appleLogin(
    @GetUser() user: DecodedIdToken,
    @DeviceId(new ParseUUIDPipe()) deviceId: string
  ): Promise<AppleLoginResponseDto> {
    const { sessionId, needsProfileSetup } = await this.authService.appleLogin(user, deviceId);

    return {
      message: '로그인에 성공했습니다.',
      data: {
        sessionId,
        needsProfileSetup
      }
    };
  }

  @UseGuards(SessionAuthGuard)
  @Post('/logout')
  @ApiOperation({
    summary: '로그아웃',
    description: 'x-session-id 헤더의 세션을 로그아웃합니다. 요청 처리 중 세션이 새 로그인으로 교체된 경우에는 새 세션을 유지하고 201 응답으로 교체 사실을 알립니다. 해당 세션의 상태 공유 소켓은 다음 수신 이벤트 또는 20초 주기 세션 검사에서 종료됩니다.'
  })
  @ApiSecurity('session')
  @ApiCreatedResponse({
    description: '세션 삭제 완료 또는 요청 처리 중 세션이 교체되어 새 세션을 유지함',
    type: LogoutResponseDto
  })
  @ApiUnauthorizedResponse({
    description: '세션 ID가 없거나, 세션이 유효하지 않거나, 이미 교체됨'
  })
  @ApiInternalServerErrorResponse({
    description: '로그아웃 처리 중 서버 오류 발생'
  })
  public async logout(
    @GetUser() user: SessionPayload
  ): Promise<LogoutResponseDto> {
    const result = await this.authService.logout(user);

    return {
      message: result ? '로그아웃에 성공했습니다.' : '이미 교체된 세션입니다.'
    };
  }
}
