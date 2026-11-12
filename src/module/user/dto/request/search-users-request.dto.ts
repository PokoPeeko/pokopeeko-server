import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from "class-validator";

export class SearchUsersQueryDto {
    @ApiPropertyOptional({ description: '사용자 표시 이름의 부분 검색어. 앞뒤 공백을 제거하며, 생략하면 본인을 제외한 전체 사용자를 조회합니다. 문자열 하나만 전달할 수 있습니다.', type: String, example: '포코' })
    @IsOptional()
    @IsString()
    keyword?: string;
}
