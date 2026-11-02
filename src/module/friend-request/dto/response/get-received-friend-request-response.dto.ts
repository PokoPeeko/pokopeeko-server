import { ApiProperty } from "@nestjs/swagger";
import { GlobalResponse } from "src/common/dto/global-response.dto";

import { FriendsProperty } from '../../../friend/dto/response/search-friends-response.dto';

export class ReceivedFriendRequestProperty {
    @ApiProperty({ description: '친구 요청 ID. BigInt를 문자열로 반환', type: String, pattern: '^[0-9]+$', example: '123' })
    id!: string;

    @ApiProperty({ description: '요청을 보낸 사용자 정보', type: FriendsProperty })
    requester!: FriendsProperty;
}

export class GetReceivedFriendRequestResponseData {
    @ApiProperty({ description: '대기 중인 받은 친구 요청 목록. 결과가 없으면 빈 배열', type: [ReceivedFriendRequestProperty] })
    friendRequests!: ReceivedFriendRequestProperty[];
}

export class GetReceivedFriendRequestResponseDto extends GlobalResponse<GetReceivedFriendRequestResponseData> {
    @ApiProperty({
        description: '요청 성공 여부',
        example: true
    })
    declare success?: boolean;

    @ApiProperty({
        description: '응답 메시지',
        example: '받은 친구 요청 목록 조회에 성공했습니다.'
    })
    declare message: string;

    @ApiProperty({
        description: '받은 친구 요청 목록 조회 결과',
        type: GetReceivedFriendRequestResponseData
    })
    declare data: GetReceivedFriendRequestResponseData;
}
