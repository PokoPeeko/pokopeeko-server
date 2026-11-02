import { ApiProperty } from "@nestjs/swagger";
import { GlobalResponse } from "src/common/dto/global-response.dto";

import { FriendsProperty } from '../../../friend/dto/response/search-friends-response.dto';

export class SentFriendRequestProperty {
    @ApiProperty({ description: '친구 요청 ID. BigInt를 문자열로 반환', type: String, pattern: '^[0-9]+$', example: '123' })
    id!: string;

    @ApiProperty({ description: '요청을 받은 사용자 정보', type: FriendsProperty })
    addressee!: FriendsProperty;
}

export class GetSentFriendRequestResponseData {
    @ApiProperty({ description: '대기 중인 보낸 친구 요청 목록. 결과가 없으면 빈 배열', type: [SentFriendRequestProperty] })
    friendRequests!: SentFriendRequestProperty[];
}

export class GetSentFriendRequestResponseDto extends GlobalResponse<GetSentFriendRequestResponseData> {
    @ApiProperty({
        description: '요청 성공 여부',
        example: true
    })
    declare success?: boolean;

    @ApiProperty({
        description: '응답 메시지',
        example: '보낸 친구 요청 목록 조회에 성공했습니다.'
    })
    declare message: string;

    @ApiProperty({
        description: '보낸 친구 요청 목록 조회 결과',
        type: GetSentFriendRequestResponseData
    })
    declare data: GetSentFriendRequestResponseData;
}
