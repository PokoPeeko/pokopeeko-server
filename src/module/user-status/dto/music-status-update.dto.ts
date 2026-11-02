import { ApiProperty } from '@nestjs/swagger';
import { IsString, Length, Matches } from 'class-validator';

export class MusicStatusUpdateDto {
    @ApiProperty({
        description: '현재 재생 중인 곡의 가수 또는 아티스트 이름. 공백만 있는 문자열은 허용하지 않습니다.',
        minLength: 1,
        maxLength: 200,
        pattern: '\\S',
        example: '아이유'
    })
    @IsString()
    @Length(1, 200)
    @Matches(/\S/, { message: '공백만 입력할 수 없습니다.' })
    artistName!: string;

    @ApiProperty({
        description: '현재 재생 중인 곡 제목. 공백만 있는 문자열은 허용하지 않습니다.',
        minLength: 1,
        maxLength: 200,
        pattern: '\\S',
        example: '밤편지'
    })
    @IsString()
    @Length(1, 200)
    @Matches(/\S/, { message: '공백만 입력할 수 없습니다.' })
    trackTitle!: string;
}
