import { WindowStatusUpdateDto } from './dto/window-status-update.dto';
import { MusicStatusUpdateDto } from './dto/music-status-update.dto';
import {
    MusicStatusUpdatedDto,
    UserStatusAuthDto,
    UserStatusExceptionDto,
    UserStatusRemovedDto,
    WindowStatusUpdatedDto
} from './dto/user-status-event.dto';

export const USER_STATUS_SWAGGER_MODELS = [
    UserStatusAuthDto,
    WindowStatusUpdateDto,
    MusicStatusUpdateDto,
    WindowStatusUpdatedDto,
    MusicStatusUpdatedDto,
    UserStatusRemovedDto,
    UserStatusExceptionDto
];

export const USER_STATUS_SWAGGER_DESCRIPTION = `
## 실시간 상태 공유 (Socket.IO)

상태 공유는 HTTP API가 아닌 Socket.IO 이벤트입니다. Swagger의 Try it out으로 실행할 수 없으며 Socket.IO 클라이언트를 사용해야 합니다.

### 연결과 인증

- Gateway 포트: **80** (HTTP API 서버의 PORT와 별도 설정)
- Namespace: **/user-status**
- Handshake path: **/socket.io/** (HTTP 전역 접두사 /api는 붙이지 않습니다.)
- 로컬 연결 URL: **http://localhost:80/user-status**
- 인증: 연결 옵션의 **auth.sessionId**로 로그인에서 발급받은 세션 ID를 전달합니다. 아래 UserStatusAuthDto 스키마를 참고하세요.
- 연결 전에 이벤트 리스너를 등록하면 연결 직후 전달되는 친구 상태를 받을 수 있습니다.
- 연결 인증 실패는 **connect_error** 이벤트로 전달됩니다. 연결된 뒤 인증 실패는 **exception** 이벤트 전송 후 연결 종료로 처리됩니다.
- 연결 후에도 모든 수신 이벤트와 별도의 20초 주기 검사에서 세션을 검증합니다. 주기 검사 중 Redis 등 일반 서버 오류가 발생하면 로그를 남기고 연결은 유지합니다.

~~~ts
const socket = io('http://localhost:80/user-status', {
  autoConnect: false,
  auth: { sessionId: '로그인으로 발급받은 세션 ID' },
});

socket.on('window_status:updated', (status) => console.log(status));
socket.on('music_status:updated', (status) => console.log(status));
socket.on('user_status:removed', ({ userId }) => console.log(userId));
socket.on('exception', (error) => console.error(error));
socket.on('connect_error', (error) => console.error(error.message));
socket.connect();
~~~

### 클라이언트 → 서버

| 이벤트 | Payload 스키마 | 처리 |
| --- | --- | --- |
| window_status:update | WindowStatusUpdateDto | 앱 제목과 작업 내용을 저장하고 현재 ACCEPTED 친구들에게 전송 |
| music_status:update | MusicStatusUpdateDto | 가수명과 곡 제목을 저장하고 현재 ACCEPTED 친구들에게 전송 |
| friends_status:get | 없음 | 요청한 소켓에 현재 저장된 친구들의 앱·음악 상태를 개별 이벤트로 전송 |
| user_status:heartbeat | 없음 | 본인의 기존 앱·음악 상태 키 TTL을 각각 60초로 갱신 |

앱·음악 필드는 모두 필수 문자열이며, 빈 값·공백만 있는 값·알 수 없는 필드는 거절합니다. 최대 길이는 앱 제목 100자, 작업 내용 500자, 가수명·곡 제목 각각 200자입니다. 사용자 ID는 payload로 받지 않고 검증된 세션에서 결정합니다.

~~~ts
socket.emit('window_status:update', {
  appTitle: 'Visual Studio Code',
  taskDescription: 'PokoPeeko 서버 개발 중',
});
socket.emit('music_status:update', { artistName: '아이유', trackTitle: '밤편지' });
socket.emit('friends_status:get');
~~~

위 이벤트의 핸들러는 ACK 데이터를 반환하지 않습니다. friends_status:get 결과는 요청한 소켓의 window_status:updated, music_status:updated 리스너로 받습니다.

### 서버 → 클라이언트

| 이벤트 | Payload 스키마 | 전달 시점 |
| --- | --- | --- |
| window_status:updated | WindowStatusUpdatedDto | 친구의 앱 상태 변경 또는 친구 상태 조회 |
| music_status:updated | MusicStatusUpdatedDto | 친구의 음악 상태 변경 또는 친구 상태 조회 |
| user_status:removed | UserStatusRemovedDto | 사용자의 마지막 소켓 종료 후 앱·음악 상태를 삭제했을 때 현재 친구들에게 전달 |
| exception | UserStatusExceptionDto | 연결 이후 입력 검증·인증·서버 오류 |

updatedAt은 서버가 Redis에 저장한 Unix timestamp(밀리초)입니다. 초기 조회와 실시간 이벤트에 같은 형식으로 포함되며, deviceId는 공개하지 않습니다.

연결 성공 시 친구 상태를 자동 조회합니다. 조회는 ACCEPTED 관계만 대상으로 하며 저장된 상태가 없거나 만료됐으면 해당 상태 이벤트를 보내지 않습니다. 빈 목록이나 조회 완료를 나타내는 별도 이벤트는 없으므로, friends_status:get 자체가 클라이언트의 오래된 상태를 지우지는 않습니다.

친구가 새로 생기면 다음 상태 업데이트부터 전달됩니다. 저장된 상태를 바로 받으려면 friends_status:get을 요청하세요. 친구 수락 시 자동 재조회 알림은 현재 제공하지 않습니다.

### TTL과 연결 종료

- 앱·음악 상태의 TTL은 각각 **60초**입니다. 연결된 동안 **20초마다 user_status:heartbeat**를 보내는 방식을 권장합니다.
- heartbeat는 상태 내용이나 updatedAt을 변경하지 않고, 만료되거나 없는 키를 복원하지 않습니다. 재연결 시 현재 앱·음악 상태를 다시 전송하세요.
- 동일 사용자의 소켓이 여러 개라면 마지막 소켓이 종료될 때만 상태를 삭제합니다. user_status:removed를 받으면 해당 userId의 앱·음악 상태를 모두 지우세요.
- Redis TTL의 자연 만료만으로 user_status:removed가 전송되지는 않습니다.
- 세션 무효화 후 별도 이벤트를 보내지 않아도 20초 주기 검사에서 발견하면 연결을 종료합니다. 검사 전까지 수신이 이어질 수 있으며, Redis 응답 지연이나 장애 시 종료가 지연될 수 있습니다.

~~~ts
const heartbeatTimer = setInterval(() => {
  if (socket.connected) socket.emit('user_status:heartbeat');
}, 20_000);

// 클라이언트 화면/기능 종료 시 정리
// clearInterval(heartbeatTimer);
// socket.disconnect();
~~~

### 오류 처리

- 연결 인증 실패: connect_error의 message가 '세션이 없습니다.' 또는 '유효하지 않은 세션입니다.'입니다.
- VALIDATION_ERROR: exception 이벤트의 errors에 필드별 오류 배열이 포함됩니다. 소켓 연결은 유지됩니다.
- WS_ERROR: 세션이 없거나 만료·교체된 경우 등입니다. UnauthorizedException인 경우 오류 전송 후 해당 namespace 연결을 종료합니다.
- INTERNAL_SERVER_ERROR: 예기치 않은 서버 오류이며 message는 'An unexpected error occurred'입니다.

연결 종료 후 다시 연결하려면 유효한 auth.sessionId를 설정하고 connect()를 호출하세요. Socket.IO의 서버 측 강제 종료 이후에는 클라이언트가 명시적으로 재연결해야 합니다.
`;
