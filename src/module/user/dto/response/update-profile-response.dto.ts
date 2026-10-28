import { ApiProperty } from '@nestjs/swagger';

export class UpdateProfileResponseData {
    @ApiProperty({
        description: '사용자 표시 이름',
        type: String,
        nullable: true,
        example: '권수영'
    })
    displayName!: string | null;

    @ApiProperty({
        description: '저장된 프로필 이미지 파일명입니다. UUID와 원본 확장자로 구성됩니다.',
        type: String,
        nullable: true,
        example: '550e8400-e29b-41d4-a716-446655440000.png'
    })
    profileImage!: string | null;
}

export class UpdateProfileResponseDto {
    @ApiProperty({
        description: '요청 성공 여부',
        example: true
    })
    declare success?: boolean;
    
    @ApiProperty({
        description: '응답 메시지',
        example: '프로필 수정에 성공했습니다.'
    })
    declare message: string;
    
    @ApiProperty({
        description: '수정된 프로필 정보',
        type: UpdateProfileResponseData
    })
    declare data: UpdateProfileResponseData;
}
