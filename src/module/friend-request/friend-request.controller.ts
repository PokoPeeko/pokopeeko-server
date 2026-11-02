import { ApiTags, ApiSecurity, ApiOperation, ApiParam, ApiOkResponse, ApiCreatedResponse, ApiBadRequestResponse, ApiNotFoundResponse, ApiUnauthorizedResponse, ApiInternalServerErrorResponse } from '@nestjs/swagger';
import { Controller, Delete, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { FriendRequestService } from './friend-request.service';
import { GetUser } from 'src/common/decorator/get-user.decorator';
import { type SessionPayload } from '../auth/interface/session-payload.interface';
import { SendFriendRequestResponseDto } from './dto/response/send-friend-request-response.dto';
import { GetReceivedFriendRequestResponseDto } from './dto/response/get-received-friend-request-response.dto';
import { GetSentFriendRequestResponseDto } from './dto/response/get-sent-friend-request-response.dto';
import { ParseBigIntPipe } from 'src/pipe/parse-bigint.pipe';
import { SessionAuthGuard } from '../auth/guard/session-auth.guard';

@ApiTags('FriendRequest')
@ApiSecurity('session')
@ApiUnauthorizedResponse({ description: '세션 ID가 없거나, 세션이 유효하지 않거나, 이미 교체됨' })
@ApiInternalServerErrorResponse({ description: '요청 처리 중 서버 오류 발생' })
@Controller('friend-request')
@UseGuards(SessionAuthGuard)
export class FriendRequestController {
  constructor(private readonly friendRequestService: FriendRequestService) {}

  // 친구 요청 보내기
  @Post('/:addresseeId')
  @ApiOperation({ summary: '친구 요청 보내기', description: '상대방에게 친구 요청을 보냅니다. 거절된 관계가 있으면 기존 요청 ID를 재사용하고 요청 방향을 갱신합니다. 자기 자신, 이미 친구인 사용자, 어느 방향이든 대기 중인 요청이 있는 사용자에게는 요청할 수 없습니다.' })
  @ApiParam({ name: 'addresseeId', description: '요청을 받을 사용자 ID', type: String, format: 'uuid' })
  @ApiCreatedResponse({ description: '친구 요청 생성 또는 거절된 요청의 재요청 완료', type: SendFriendRequestResponseDto })
  @ApiBadRequestResponse({ description: '자기 자신에게 요청하거나, 이미 친구이거나, 대기 중인 요청이 존재함' })
  @ApiNotFoundResponse({ description: '친구 요청을 받을 사용자가 존재하지 않음' })
  public async sendFriendRequest(
    @GetUser() user: SessionPayload,
    @Param('addresseeId') addresseeId: string
  ): Promise<SendFriendRequestResponseDto> {
    const friendRequest = await this.friendRequestService.sendFriendRequest(user, addresseeId);

    return {
      message: '친구 요청 보내기에 성공했습니다.',
      data: {
        friendRequestId: friendRequest.id.toString()
      }
    };
  }

  // 받은 친구 요청 목록 조회하기
  @Get('/requests/received')
  @ApiOperation({ summary: '받은 친구 요청 목록 조회', description: '로그인한 사용자가 받은 요청 중 PENDING 상태인 요청만 조회합니다. 요청 ID는 문자열로 반환합니다.' })
  @ApiOkResponse({ description: '받은 친구 요청 목록 조회 완료', type: GetReceivedFriendRequestResponseDto })
  public async getReceivedFriendRequests(
    @GetUser() user: SessionPayload
  ): Promise<GetReceivedFriendRequestResponseDto> {
    const friendRequests = await this.friendRequestService.getReceivedFriendRequests(user);

    return {
      message: '받은 친구 요청 목록 조회에 성공했습니다.',
      data: {
        friendRequests: friendRequests.map(({ id, ...rest }) => ({
          ...rest,
          id: id.toString()
        }))
      }
    };
  }

  // 보낸 친구 요청 목록 조회하기
  @Get('/requests/sent')
  @ApiOperation({ summary: '보낸 친구 요청 목록 조회', description: '로그인한 사용자가 보낸 요청 중 PENDING 상태인 요청만 조회합니다. 요청 ID는 문자열로 반환합니다.' })
  @ApiOkResponse({ description: '보낸 친구 요청 목록 조회 완료', type: GetSentFriendRequestResponseDto })
  public async getSentFriendRequests(
    @GetUser() user: SessionPayload
  ): Promise<GetSentFriendRequestResponseDto> {
    const friendRequests = await this.friendRequestService.getSentFriendRequests(user);

    return {
      message: '보낸 친구 요청 목록 조회에 성공했습니다.',
      data: {
        friendRequests: friendRequests.map(({ id, ...rest }) => ({
          ...rest,
          id: id.toString()
        }))
      }
    };
  }

  // 친구 요청 취소하기
  @Delete('/:friendRequestId/cancel')
  @ApiOperation({ summary: '친구 요청 취소', description: '대기 중인 친구 요청을 요청자 본인만 취소할 수 있습니다. 요청을 삭제하며 이후 다시 요청할 수 있습니다.' })
  @ApiParam({ name: 'friendRequestId', description: '취소할 친구 요청 ID. 숫자로만 구성된 문자열', schema: { type: 'string', pattern: '^[0-9]+$', example: '123' } })
  @ApiOkResponse({ description: '친구 요청 취소 완료', schema: { type: 'object', required: ['success', 'message', 'data'], properties: { success: { type: 'boolean', example: true }, message: { type: 'string', example: '친구 요청 취소에 성공했습니다.' }, data: { type: 'object', nullable: true, example: null, description: '추가 응답 데이터 없음' } } } })
  @ApiBadRequestResponse({ description: '요청 ID가 숫자 문자열이 아니거나, 대기 중인 요청이 아니거나, 요청자 본인이 아님' })
  @ApiNotFoundResponse({ description: '친구 요청 정보가 존재하지 않음' })
  public async cancelFriendRequest(
    @GetUser() user: SessionPayload,
    @Param('friendRequestId', ParseBigIntPipe) friendRequestId: bigint
  ) {
    await this.friendRequestService.cancelFriendRequest(user, friendRequestId);

    return {
      message: '친구 요청 취소에 성공했습니다.'
    };
  }

  // 친구 요청 수락하기
  @Patch('/:friendRequestId/accept')
  @ApiOperation({ summary: '친구 요청 수락', description: '대기 중인 친구 요청을 수신자 본인만 수락할 수 있습니다. 상태를 ACCEPTED로 변경하여 친구 관계를 맺습니다.' })
  @ApiParam({ name: 'friendRequestId', description: '수락할 친구 요청 ID. 숫자로만 구성된 문자열', schema: { type: 'string', pattern: '^[0-9]+$', example: '123' } })
  @ApiOkResponse({ description: '친구 요청 수락 완료', schema: { type: 'object', required: ['success', 'message', 'data'], properties: { success: { type: 'boolean', example: true }, message: { type: 'string', example: '친구 요청 수락에 성공했습니다.' }, data: { type: 'object', nullable: true, example: null, description: '추가 응답 데이터 없음' } } } })
  @ApiBadRequestResponse({ description: '요청 ID가 숫자 문자열이 아니거나, 대기 중인 요청이 아니거나, 수신자 본인이 아님' })
  @ApiNotFoundResponse({ description: '친구 요청 정보가 존재하지 않음' })
  public async acceptFriendRequest(
    @GetUser() user: SessionPayload,
    @Param('friendRequestId', ParseBigIntPipe) friendRequestId: bigint
  ) {
    await this.friendRequestService.acceptFriendRequest(user, friendRequestId);

    return {
      message: '친구 요청 수락에 성공했습니다.'
    };
  }

  // 친구 요청 거절하기
  @Patch('/:friendRequestId/reject')
  @ApiOperation({ summary: '친구 요청 거절', description: '대기 중인 친구 요청을 수신자 본인만 거절할 수 있습니다. 상태를 REJECTED로 변경하며 이후 재요청할 수 있습니다.' })
  @ApiParam({ name: 'friendRequestId', description: '거절할 친구 요청 ID. 숫자로만 구성된 문자열', schema: { type: 'string', pattern: '^[0-9]+$', example: '123' } })
  @ApiOkResponse({ description: '친구 요청 거절 완료', schema: { type: 'object', required: ['success', 'message', 'data'], properties: { success: { type: 'boolean', example: true }, message: { type: 'string', example: '친구 요청 거절에 성공했습니다.' }, data: { type: 'object', nullable: true, example: null, description: '추가 응답 데이터 없음' } } } })
  @ApiBadRequestResponse({ description: '요청 ID가 숫자 문자열이 아니거나, 대기 중인 요청이 아니거나, 수신자 본인이 아님' })
  @ApiNotFoundResponse({ description: '친구 요청 정보가 존재하지 않음' })
  public async rejectFriendRequest(
    @GetUser() user: SessionPayload,
    @Param('friendRequestId', ParseBigIntPipe) friendRequestId: bigint
  ) {
    await this.friendRequestService.rejectFriendRequest(user, friendRequestId);

    return {
      message: '친구 요청 거절에 성공했습니다.'
    };
  }
}
