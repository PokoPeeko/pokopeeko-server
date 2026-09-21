import { Body, Controller, ParseUUIDPipe, Post, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AppleLoginResponseDto } from './dto/response/apple-login-response.dto';
import { DeviceId } from 'src/common/decorator/device-id.decorator';
import { FirebaseGuard } from './guard/firebase.guard';
import { GetUser } from 'src/common/decorator/get-user.decorator';
import { AppleLoginRequestDto } from './dto/request/apple-login-request.dto';
import { type DecodedIdToken } from 'firebase-admin/auth';
import { ApiBadRequestResponse, ApiBearerAuth, ApiHeader, ApiInternalServerErrorResponse, ApiOkResponse, ApiOperation, ApiTags, ApiUnauthorizedResponse } from '@nestjs/swagger';

@ApiTags('Auth')
@ApiBearerAuth('jwt')
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
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @UseGuards(FirebaseGuard)
  @Post('/login/apple')
  @ApiOperation({
    summary: 'Apple 로그인',
    description: 'Firebase에서 발급받은 Apple 로그인 ID 토큰을 검증한 뒤 사용자를 조회하거나 생성하고, 디바이스별 세션을 발급합니다. Authorization 헤더에는 Bearer 형식의 Firebase ID 토큰을, x-device-id 헤더에는 디바이스 UUID를 전달해야 합니다.'
  })
  @ApiOkResponse({
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
  public async appleLogin(
    @GetUser() user: DecodedIdToken,
    @Body() dto: AppleLoginRequestDto,
    @DeviceId(new ParseUUIDPipe()) deviceId: string
  ): Promise<AppleLoginResponseDto> {
    const { sessionId } = await this.authService.appleLogin(user, dto, deviceId);

    return {
      message: '로그인에 성공했습니다.',
      data: {
        sessionId
      }
    };
  }
}
