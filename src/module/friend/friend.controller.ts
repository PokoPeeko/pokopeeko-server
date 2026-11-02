import { ApiTags, ApiSecurity, ApiOperation, ApiParam, ApiOkResponse, ApiBadRequestResponse, ApiNotFoundResponse, ApiUnauthorizedResponse, ApiInternalServerErrorResponse } from '@nestjs/swagger';
import { Controller, Delete, Get, Param, Query, UseGuards } from '@nestjs/common';
import { FriendService } from './friend.service';
import { SessionAuthGuard } from '../auth/guard/session-auth.guard';
import { GetUser } from 'src/common/decorator/get-user.decorator';
import { type SessionPayload } from '../auth/interface/session-payload.interface';
import { SearchFriendsResponseDto } from './dto/response/search-friends-response.dto';
import { SearchFriendsQueryDto } from './dto/request/search-friends-request.dto';

@ApiTags('Friend')
@ApiSecurity('session')
@ApiUnauthorizedResponse({ description: '세션 ID가 없거나, 세션이 유효하지 않거나, 이미 교체됨' })
@ApiInternalServerErrorResponse({ description: '요청 처리 중 서버 오류 발생' })
@Controller('friend')
@UseGuards(SessionAuthGuard)
export class FriendController {
  constructor(private readonly friendService: FriendService) {}

  // 친구 검색하기
  @Get('/search')
  @ApiOperation({ summary: '친구 검색', description: '로그인한 사용자의 수락된 친구 관계에서 상대방의 표시 이름으로 검색합니다. 보낸 요청과 받은 요청 모두에서 친구를 조회하며, 대기·거절 상태의 관계는 제외합니다.' })
  @ApiOkResponse({ description: '친구 검색 완료', type: SearchFriendsResponseDto })
  @ApiBadRequestResponse({ description: 'keyword가 문자열 하나가 아니거나, 허용되지 않은 쿼리 파라미터가 포함됨' })
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
  @ApiOperation({ summary: '친구 삭제', description: '상대방과의 수락된 친구 관계를 삭제합니다. 친구 요청을 보낸 방향과 관계없이 삭제할 수 있습니다.' })
  @ApiParam({ name: 'addresseeId', description: '삭제할 친구의 사용자 ID', type: String, format: 'uuid' })
  @ApiOkResponse({ description: '친구 삭제 완료', schema: { type: 'object', required: ['success', 'message', 'data'], properties: { success: { type: 'boolean', example: true }, message: { type: 'string', example: '친구 삭제에 성공했습니다.' }, data: { type: 'object', nullable: true, example: null, description: '추가 응답 데이터 없음' } } } })
  @ApiBadRequestResponse({ description: '상대방과 친구 관계가 아님' })
  @ApiNotFoundResponse({ description: '삭제할 친구의 사용자 정보가 존재하지 않음' })
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
