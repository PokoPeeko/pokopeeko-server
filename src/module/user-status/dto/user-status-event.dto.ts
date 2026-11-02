import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { WindowStatusUpdateDto } from './window-status-update.dto';
import { MusicStatusUpdateDto } from './music-status-update.dto';

export class UserStatusAuthDto {
    @ApiProperty({
        description: '로그인으로 발급받은 세션 ID. Socket.IO 연결 옵션의 auth.sessionId로 전달합니다.',
        format: 'uuid',
        example: '550e8400-e29b-41d4-a716-446655440000'
    })
    sessionId!: string;
}

export class WindowStatusUpdatedDto extends WindowStatusUpdateDto {
    @ApiProperty({
        description: '상태를 공유한 친구의 사용자 ID',
        format: 'uuid',
        example: '9f02a61e-2adc-4e23-b0ae-c47a9bd8c788'
    })
    userId!: string;

    @ApiProperty({
        description: '서버에서 상태를 저장한 시각. Unix timestamp 밀리초 단위이며 초기 조회와 실시간 전송에 같은 값을 사용합니다.',
        type: Number,
        format: 'int64',
        example: 1793574000000
    })
    updatedAt!: number;
}

export class MusicStatusUpdatedDto extends MusicStatusUpdateDto {
    @ApiProperty({
        description: '상태를 공유한 친구의 사용자 ID',
        format: 'uuid',
        example: '9f02a61e-2adc-4e23-b0ae-c47a9bd8c788'
    })
    userId!: string;

    @ApiProperty({
        description: '서버에서 상태를 저장한 시각. Unix timestamp 밀리초 단위이며 초기 조회와 실시간 전송에 같은 값을 사용합니다.',
        type: Number,
        format: 'int64',
        example: 1793574000000
    })
    updatedAt!: number;
}

export class UserStatusRemovedDto {
    @ApiProperty({
        description: '마지막 소켓이 종료되어 앱·음악 상태가 삭제된 사용자의 ID',
        format: 'uuid',
        example: '9f02a61e-2adc-4e23-b0ae-c47a9bd8c788'
    })
    userId!: string;
}

export class UserStatusExceptionDto {
    @ApiProperty({ description: '요청 성공 여부. 오류 응답에서는 false', example: false })
    success!: boolean;

    @ApiProperty({
        description: '입력 검증 오류, 세션 등 WebSocket 오류 또는 예기치 않은 서버 오류',
        enum: ['VALIDATION_ERROR', 'WS_ERROR', 'INTERNAL_SERVER_ERROR'],
        example: 'VALIDATION_ERROR'
    })
    code!: string;

    @ApiProperty({ description: '오류 메시지', example: 'Validation Error' })
    message!: string;

    @ApiPropertyOptional({
        description: 'VALIDATION_ERROR인 경우 제공되는 필드별 오류 목록',
        type: 'object',
        additionalProperties: { type: 'array', items: { type: 'string' } },
        example: { appTitle: ['공백만 입력할 수 없습니다.'] }
    })
    errors?: Record<string, string[]>;
}
