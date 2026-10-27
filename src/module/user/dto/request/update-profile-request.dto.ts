import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, Length, Matches } from 'class-validator';

export class UpdateProfileRequestDto {
    @ApiPropertyOptional({
        description: '변경할 사용자 표시 이름입니다. 공백 없이 1~10자로 입력하며, 생략하면 기존 이름을 유지합니다.',
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
