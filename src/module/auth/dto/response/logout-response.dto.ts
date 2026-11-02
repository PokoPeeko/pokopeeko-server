import { ApiProperty } from "@nestjs/swagger";

export class LogoutResponseDto {
  @ApiProperty({
    description: '요청 성공 여부',
    example: true
  })
  declare success?: boolean;

  @ApiProperty({
    description: '세션 삭제 시 "로그아웃에 성공했습니다.", 요청 처리 중 세션이 교체된 경우 "이미 교체된 세션입니다."',
    example: '로그아웃에 성공했습니다.'
  })
  declare message: string;

  @ApiProperty({
    description: '추가 응답 데이터 없음',
    type: 'object',
    properties: {},
    nullable: true,
    example: null
  })
  declare data?: null;
}
