import { ApiProperty } from "@nestjs/swagger";
import { GlobalResponse } from "src/common/dto/global-response.dto";

export class UsersProperty {
    @ApiProperty({ description: '사용자 ID', format: 'uuid', example: '550e8400-e29b-41d4-a716-446655440000' })
    id!: string;
    @ApiProperty({ description: '사용자 표시 이름', type: String, nullable: true, example: '포코' })
    displayName!: string | null;
    @ApiProperty({ description: '프로필 이미지 파일명', type: String, nullable: true, example: '550e8400-e29b-41d4-a716-446655440000.png' })
    profileImage!: string | null;
}

export class SearchUsersResponseData {
    @ApiProperty({ description: '검색된 사용자 목록. 인증된 사용자 본인은 제외하며, 결과가 없으면 빈 배열', type: [UsersProperty] })
    users!: UsersProperty[];
}

export class SearchUsersResponseDto extends GlobalResponse<SearchUsersResponseData> {
  @ApiProperty({
    description: '요청 성공 여부',
    example: true
  })
  declare success?: boolean;

  @ApiProperty({
    description: '응답 메시지',
    example: '사용자 검색에 성공했습니다.'
  })
  declare message: string;

  @ApiProperty({
    description: '사용자 검색 결과',
    type: SearchUsersResponseData
  })
  declare data: SearchUsersResponseData;
}
