import { Controller, Delete, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { FriendRequestService } from './friend-request.service';
import { GetUser } from 'src/common/decorator/get-user.decorator';
import { type SessionPayload } from '../auth/interface/session-payload.interface';
import { SendFriendRequestResponseDto } from './dto/response/send-friend-request-response.dto';
import { GetReceivedFriendRequestResponseDto } from './dto/response/get-received-friend-request-response.dto';
import { GetSentFriendRequestResponseDto } from './dto/response/get-sent-friend-request-response.dto';
import { ParseBigIntPipe } from 'src/pipe/parse-bigint.pipe';
import { SessionAuthGuard } from '../auth/guard/session-auth.guard';

@Controller('friend-request')
@UseGuards(SessionAuthGuard)
export class FriendRequestController {
  constructor(private readonly friendRequestService: FriendRequestService) {}

  // 친구 요청 보내기
  @Post('/:addresseeId')
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
