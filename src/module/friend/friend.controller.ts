import { Controller, Delete, Get, Param, Query, UseGuards } from '@nestjs/common';
import { FriendService } from './friend.service';
import { SessionAuthGuard } from '../auth/guard/session-auth.guard';
import { GetUser } from 'src/common/decorator/get-user.decorator';
import { type SessionPayload } from '../auth/interface/session-payload.interface';
import { SearchFriendsResponseDto } from './dto/response/search-friends-response.dto';
import { SearchFriendsQueryDto } from './dto/request/search-friends-request.dto';

@Controller('friend')
@UseGuards(SessionAuthGuard)
export class FriendController {
  constructor(private readonly friendService: FriendService) {}

  // 친구 검색하기
  @Get('/search')
  public async searchFriends(
    @GetUser() user: SessionPayload,
    @Query() query: SearchFriendsQueryDto
  ): Promise<SearchFriendsResponseDto> {
    const friends = await this.friendService.searchFriends(user, query.keyword?.trim());

    return {
      message: '친구 검색에 성공했습니다.',
      data: {
        friends
      }
    };
  }

  // 친구 삭제하기
  @Delete('/:addresseeId')
  public async removeFriend(
    @GetUser() user: SessionPayload,
    @Param('addresseeId') addresseeId: string
  ) {
    await this.friendService.removeFriend(user, addresseeId);

    return {
      message: '친구 삭제에 성공했습니다.'
    };
  }
}
