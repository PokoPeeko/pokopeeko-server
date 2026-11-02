import { ApiProperty } from '@nestjs/swagger';
import { IsString, Length, Matches } from 'class-validator';

export class WindowStatusUpdateDto {
    @ApiProperty({
        description: '현재 사용 중인 앱의 제목. 공백만 있는 문자열은 허용하지 않습니다.',
        minLength: 1,
        maxLength: 100,
        pattern: '\\S',
        example: 'Visual Studio Code'
    })
    @IsString()
    @Length(1, 100)
    @Matches(/\S/, { message: '공백만 입력할 수 없습니다.' })
    appTitle!: string;

    @ApiProperty({
        description: '앱에서 수행 중인 작업 내용. 문장 내부 공백은 허용합니다.',
        minLength: 1,
        maxLength: 500,
        pattern: '\\S',
        example: 'PokoPeeko 서버 개발 중'
    })
    @IsString()
    @Length(1, 500)
    @Matches(/\S/, { message: '공백만 입력할 수 없습니다.' })
    taskDescription!: string;
}
