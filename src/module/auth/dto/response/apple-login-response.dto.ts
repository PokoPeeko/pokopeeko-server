import { ApiProperty } from '@nestjs/swagger';
import { GlobalResponse } from 'src/common/dto/global-response.dto';

export class AppleLoginResponseData {
  @ApiProperty({
    description: '발급된 세션 ID',
    format: 'uuid',
    example: '550e8400-e29b-41d4-a716-446655440000'
  })
  sessionId: string;

  @ApiProperty({
    description: '프로필 설정 여부 플래그. 현재 구현에서는 기존 사용자이면 true, 신규 사용자이면 false를 반환합니다.',
    type: Boolean,
    example: false
  })
  needsProfileSetup: boolean;
}

export class AppleLoginResponseDto extends GlobalResponse<AppleLoginResponseData> {
  @ApiProperty({
    description: '요청 성공 여부',
    example: true
  })
  declare success?: boolean;

  @ApiProperty({
    description: '응답 메시지',
    example: '로그인에 성공했습니다.'
  })
  declare message: string;

  @ApiProperty({
    description: '로그인 응답 데이터',
    type: AppleLoginResponseData
  })
  declare data: AppleLoginResponseData;
}
