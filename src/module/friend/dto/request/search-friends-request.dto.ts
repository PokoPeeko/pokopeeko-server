import { IsOptional, IsString } from 'class-validator';

export class SearchFriendsQueryDto {
    @IsOptional()
    @IsString()
    keyword?: string;
}
