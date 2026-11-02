import { Module } from '@nestjs/common';
import { UserStatusService } from './user-status.service';
import { UserStatusGateway } from './user-status.gateway';
import { FriendModule } from '../friend/friend.module';

@Module({
  imports: [FriendModule],
  providers: [
    UserStatusService,
    UserStatusGateway
  ],
})
export class UserStatusModule {}
