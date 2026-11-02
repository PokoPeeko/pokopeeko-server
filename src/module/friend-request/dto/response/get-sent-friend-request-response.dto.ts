import { ApiProperty } from "@nestjs/swagger";
import { GlobalResponse } from "src/common/dto/global-response.dto";

export class FriendRequestProperty {
    id!: string;
    addressee!: {
        id: string;
        displayName: string | null;
        profileImage: string | null;
    };
}

export class GetSentFriendRequestResponseData {
    friendRequests!: FriendRequestProperty[];
}

export class GetSentFriendRequestResponseDto extends GlobalResponse<GetSentFriendRequestResponseData> {
    @ApiProperty({
        description: '요청 성공 여부',
        example: true
    })
    declare success?: boolean;

    @ApiProperty({
        description: '응답 메시지',
        example: ''
    })
    declare message: string;

    @ApiProperty({
        description: '',
        type: GetSentFriendRequestResponseData
    })
    declare data: GetSentFriendRequestResponseData;
}