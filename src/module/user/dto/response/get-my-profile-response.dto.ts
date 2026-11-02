import { ApiProperty } from '@nestjs/swagger';

export class GetMyProfileResponseData {
    @ApiProperty({
        description: '로그인한 사용자 본인의 ID',
        format: 'uuid',
        example: '550e8400-e29b-41d4-a716-446655440000'
    })
    id!: string;

    @ApiProperty({
        description: '사용자 표시 이름. 설정되지 않았으면 null',
        type: String,
        nullable: true,
        example: '포코'
    })
    displayName!: string | null;

    @ApiProperty({
        description: '저장된 프로필 이미지 파일명. URL이 아니며, 설정되지 않았으면 null',
        type: String,
        nullable: true,
        example: '550e8400-e29b-41d4-a716-446655440000.png'
    })
    profileImage!: string | null;
}

export class GetMyProfileResponseDto {
    @ApiProperty({
        description: '요청 성공 여부',
        example: true
    })
    declare success?: boolean;
    
    @ApiProperty({
        description: '응답 메시지',
        example: '내 프로필 조회에 성공했습니다.'
    })
    declare message: string;
    
    @ApiProperty({
        description: '로그인한 사용자 본인의 프로필 정보',
        type: GetMyProfileResponseData
    })
    declare data: GetMyProfileResponseData;
}

