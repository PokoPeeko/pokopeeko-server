import { IsOptional, IsString, Length, Matches } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class AppleLoginRequestDto {
  @ApiPropertyOptional({
    description: 'Apple에서 최초 로그인 시 제공받은 사용자 표시 이름입니다. 공백을 포함할 수 없습니다.',
    minLength: 1,
    maxLength: 10,
    pattern: '^\\S+$',
    example: '권수영'
  })
  @IsOptional()
  @IsString()
  @Length(1, 10)
  @Matches(/^\S+$/, { message: '공백을 포함할 수 없습니다.' })
  displayName: string;
}
