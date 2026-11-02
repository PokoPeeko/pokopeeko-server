import { ApiProperty } from '@nestjs/swagger';

export class GetUserProfileResponseData {
    @ApiProperty({
        description: '조회한 사용자의 ID',
        format: 'uuid',
        example: '9f02a61e-2adc-4e23-b0ae-c47a9bd8c788'
    })
    id!: string;

    @ApiProperty({
        description: '사용자 표시 이름. 설정되지 않았으면 null',
        type: String,
        nullable: true,
        example: '피코'
    })
    displayName!: string | null;

    @ApiProperty({
        description: '저장된 프로필 이미지 파일명. URL이 아니며, 설정되지 않았으면 null',
        type: String,
        nullable: true,
        example: '9f02a61e-2adc-4e23-b0ae-c47a9bd8c788.jpg'
    })
    profileImage!: string | null;
}

export class GetUserProfileResponseDto {
    @ApiProperty({
        description: '요청 성공 여부',
        example: true
    })
    declare success?: boolean;
    
    @ApiProperty({
        description: '응답 메시지',
        example: '사용자 프로필 조회에 성공했습니다.'
    })
    declare message: string;
    
    @ApiProperty({
        description: '조회한 사용자의 프로필 정보',
        type: GetUserProfileResponseData
    })
    declare data: GetUserProfileResponseData;
}

