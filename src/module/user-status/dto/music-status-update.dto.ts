import { IsString, Length, Matches } from 'class-validator';

export class MusicStatusUpdateDto {
    @IsString()
    @Length(1, 200)
    @Matches(/\S/, { message: '공백만 입력할 수 없습니다.' })
    artistName!: string;

    @IsString()
    @Length(1, 200)
    @Matches(/\S/, { message: '공백만 입력할 수 없습니다.' })
    trackTitle!: string;
}
