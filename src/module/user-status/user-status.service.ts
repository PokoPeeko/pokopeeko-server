import { InjectRedis } from '@nestjs-modules/ioredis';
import { Injectable } from '@nestjs/common';
import Redis from 'ioredis';
import { WindowStatusUpdateDto } from './dto/window-status-update.dto';
import { MusicStatusUpdateDto } from './dto/music-status-update.dto';
import { FriendService } from '../friend/friend.service';
import { CustomSocket } from '../auth/interface/custom-socket.interface';

@Injectable()
export class UserStatusService {
    private readonly STATUS_TTL_SECONDS = 60;

    constructor(
        @InjectRedis() private readonly redis: Redis,
        private readonly friendService: FriendService
    ) {}

    private getAppStatusKey(userId: string): string {
        return `user:${userId}:status:app`;
    }

    private getMusicStatusKey(userId: string): string {
        return `user:${userId}:status:music`;
    }

    public async windowStatusUpdate(
        payload: WindowStatusUpdateDto,
        client: CustomSocket
    ) {
        const session = client.data.session;
        const updatedAt = Date.now();

        await this.redis.set(
            this.getAppStatusKey(session.userId),
            JSON.stringify({
                deviceId: session.deviceId,
                appTitle: payload.appTitle,
                taskDescription: payload.taskDescription,
                updatedAt
            }),
            'EX',
            this.STATUS_TTL_SECONDS
        );

        return {
            friendIds: await this.friendService.getFriendIds(session.userId),
            updatedAt
        };
    }

    public async musicStatusUpdate(
        payload: MusicStatusUpdateDto,
        client: CustomSocket
    ) {
        const session = client.data.session;
        const updatedAt = Date.now();

        await this.redis.set(
            this.getMusicStatusKey(session.userId),
            JSON.stringify({
                deviceId: session.deviceId,
                artistName: payload.artistName,
                trackTitle: payload.trackTitle,
                status: payload.status,
                updatedAt
            }),
            'EX',
            this.STATUS_TTL_SECONDS
        );

        return {
            friendIds: await this.friendService.getFriendIds(session.userId),
            updatedAt
        };
    }

    public async musicStatusRemove(userId: string) {
        await this.redis.del(this.getMusicStatusKey(userId));

        return {
            friendIds: await this.friendService.getFriendIds(userId)
        };
    }

    public async refreshStatusTtl(userId: string): Promise<void> {
        await this.redis.multi()
            .expire(this.getAppStatusKey(userId), this.STATUS_TTL_SECONDS)
            .expire(this.getMusicStatusKey(userId), this.STATUS_TTL_SECONDS)
            .exec();
    }

    public async removeUserStatus(userId: string) {
        await this.redis.del(
            this.getAppStatusKey(userId),
            this.getMusicStatusKey(userId)
        );

        return await this.friendService.getFriendIds(userId);
    }

    public async getFriendsStatus(userId: string) {
        const friendIds = await this.friendService.getFriendIds(userId);
        const friendsWindowStatus: (WindowStatusUpdateDto & { userId: string; updatedAt: number })[] = [];
        const friendsMusicStatus: (MusicStatusUpdateDto & { userId: string; updatedAt: number })[] = [];

        if (friendIds.length === 0) {
            return { friendsWindowStatus, friendsMusicStatus };
        }

        const keys = friendIds.flatMap(id => [
            this.getAppStatusKey(id),
            this.getMusicStatusKey(id)
        ]);
        const statuses = await this.redis.mget(...keys);

        friendIds.forEach((id, index) => {
            const windowStatus = statuses[index * 2];
            const musicStatus = statuses[index * 2 + 1];

            if (windowStatus) {
                const { appTitle, taskDescription, updatedAt } = JSON.parse(windowStatus) as WindowStatusUpdateDto & { updatedAt: number };
                friendsWindowStatus.push({ userId: id, appTitle, taskDescription, updatedAt });
            }

            if (musicStatus) {
                const { artistName, trackTitle, status, updatedAt } = JSON.parse(musicStatus) as MusicStatusUpdateDto & { updatedAt: number };
                friendsMusicStatus.push({ userId: id, artistName, trackTitle, status, updatedAt });
            }
        });

        return { friendsWindowStatus, friendsMusicStatus };
    }
}
