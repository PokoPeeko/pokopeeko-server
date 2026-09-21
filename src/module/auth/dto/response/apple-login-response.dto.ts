import { ApiProperty } from '@nestjs/swagger';
import { GlobalResponse } from 'src/common/dto/global-response.dto';

export class AppleLoginResponseData {
  @ApiProperty({
    description: '발급된 세션 ID',
    format: 'uuid',
    example: '550e8400-e29b-41d4-a716-446655440000'
  })
  sessionId: string;
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
