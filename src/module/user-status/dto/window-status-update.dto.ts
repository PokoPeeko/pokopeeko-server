import { IsString, Length, Matches } from 'class-validator';

export class WindowStatusUpdateDto {
    @IsString()
    @Length(1, 100)
    @Matches(/\S/, { message: '공백만 입력할 수 없습니다.' })
    appTitle!: string;

    @IsString()
    @Length(1, 500)
    @Matches(/\S/, { message: '공백만 입력할 수 없습니다.' })
    taskDescription!: string;
}
