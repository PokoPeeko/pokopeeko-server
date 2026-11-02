import { ApiProperty } from "@nestjs/swagger";
import { GlobalResponse } from "src/common/dto/global-response.dto";

export class SendFriendRequestResponseData {
    @ApiProperty({ description: '생성하거나 재활성화한 친구 요청 ID. BigInt를 문자열로 반환', type: String, pattern: '^[0-9]+$', example: '123' })
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
        example: '친구 요청 보내기에 성공했습니다.'
    })
    declare message: string;

    @ApiProperty({
        description: '친구 요청 전송 결과',
        type: SendFriendRequestResponseData
    })
    declare data: SendFriendRequestResponseData;
}
