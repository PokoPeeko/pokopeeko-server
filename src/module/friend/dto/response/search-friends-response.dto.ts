import { ApiProperty } from "@nestjs/swagger";
import { GlobalResponse } from "src/common/dto/global-response.dto";

export class FriendsProperty {
    @ApiProperty({ description: '사용자 ID', format: 'uuid', example: '550e8400-e29b-41d4-a716-446655440000' })
    id!: string;
    @ApiProperty({ description: '사용자 표시 이름', type: String, nullable: true, example: '포코' })
    displayName!: string | null;
    @ApiProperty({ description: '프로필 이미지 파일명', type: String, nullable: true, example: '550e8400-e29b-41d4-a716-446655440000.png' })
    profileImage!: string | null;
}

export class SearchFriendsResponseData {
    @ApiProperty({ description: '검색된 친구 목록. 결과가 없으면 빈 배열', type: [FriendsProperty] })
    friends!: FriendsProperty[];
}

export class SearchFriendsResponseDto extends GlobalResponse<SearchFriendsResponseData> {
  @ApiProperty({
    description: '요청 성공 여부',
    example: true
  })
  declare success?: boolean;

  @ApiProperty({
    description: '응답 메시지',
    example: '친구 검색에 성공했습니다.'
  })
  declare message: string;

  @ApiProperty({
    description: '친구 검색 결과',
    type: SearchFriendsResponseData
  })
  declare data: SearchFriendsResponseData;
}
