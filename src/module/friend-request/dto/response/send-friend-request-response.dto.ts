import { ApiProperty } from "@nestjs/swagger";
import { GlobalResponse } from "src/common/dto/global-response.dto";

export class SendFriendRequestResponseData {
    friendRequestId!: string;
}

export class SendFriendRequestResponseDto extends GlobalResponse<SendFriendRequestResponseData> {
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
        type: SendFriendRequestResponseData
    })
    declare data: SendFriendRequestResponseData;
}