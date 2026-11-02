import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { SessionPayload } from '../auth/interface/session-payload.interface';
import prisma from 'src/database/prisma';
import { UserService } from '../user/user.service';
import { FriendService } from '../friend/friend.service';
import { FriendshipStatus } from '@prisma/client';

@Injectable()
export class FriendRequestService {
    constructor(
        private readonly userService: UserService,
        private readonly friendService: FriendService
    ) {}

    private async findFriendRequestById(friendRequestId: bigint) {
        return await prisma.friendship.findUnique({
            where: { id: friendRequestId }
        });
    }

    private async findFriendRequestByUserId(
        requesterId: string,
        addresseeId: string
    ) {
        const [userIdMin, userIdMax] = [requesterId, addresseeId].sort();

        return await prisma.friendship.findUnique({
            where: {
                userIdMin_userIdMax: {
                    userIdMin,
                    userIdMax
                }
            }
        });
    }

    public async sendFriendRequest(user: SessionPayload, addresseeId: string) {
        if (!await this.userService.findUserById(addresseeId)) {
            throw new NotFoundException('친구 요청을 보낼 사용자가 존재하지 않습니다.');
        }

        if (user.userId === addresseeId) {
            throw new BadRequestException('자기자신과는 친구가 될 수 없습니다.');
        }

        if (await this.friendService.areFriends(user.userId, addresseeId)) {
            throw new BadRequestException('상대방과 이미 친구입니다.');
        }

        const existFriendRequest = await this.findFriendRequestByUserId(user.userId, addresseeId);
        const [userIdMin, userIdMax] = [user.userId, addresseeId].sort();

        if (existFriendRequest) {
            if (existFriendRequest.status === FriendshipStatus.PENDING) {
                throw new BadRequestException('이미 대기 중인 친구 요청이 있습니다.');
            }

            return await prisma.friendship.update({
                where: {
                    userIdMin_userIdMax: {
                        userIdMin,
                        userIdMax
                    },
                    status: 'REJECTED'
                },
                data: {
                    requesterId: user.userId,
                    addresseeId,
                    status: FriendshipStatus.PENDING,
                },
                select: {
                    id: true
                }
            });
        }

        return await prisma.friendship.create({
            data: {
                requesterId: user.userId,
                addresseeId,
                userIdMin,
                userIdMax
            },
            select: {
                id: true
            }
        });
    }

    public async getReceivedFriendRequests(user: SessionPayload) {
        const friendRequests = await prisma.friendship.findMany({
            where: {
                addresseeId: user.userId,
                status: FriendshipStatus.PENDING
            },
            select: {
                id: true,
                requester: {
                    select: {
                        id: true,
                        displayName: true,
                        profileImage: true
                    }
                }
            }
        });

        return friendRequests;
    }

    public async getSentFriendRequests(user: SessionPayload) {
        const friendRequests = await prisma.friendship.findMany({
            where: {
                requesterId: user.userId,
                status: FriendshipStatus.PENDING
            },
            select: {
                id: true,
                addressee: {
                    select: {
                        id: true,
                        displayName: true,
                        profileImage: true
                    }
                }
            }
        });

        return friendRequests;
    }

    public async cancelFriendRequest(
        user: SessionPayload,
        friendRequestId: bigint
    ) {
        const friendRequest = await this.findFriendRequestById(friendRequestId);

        if (!friendRequest) {
            throw new NotFoundException('친구 요청 정보가 존재하지 않습니다.');
        }

        if (friendRequest.status !== FriendshipStatus.PENDING) {
            throw new BadRequestException('대기 중인 친구 요청이 아닙니다.');
        }

        if (friendRequest.requesterId !== user.userId) {
            throw new BadRequestException('요청자 본인만 취소할 수 있습니다.');
        }

        await prisma.friendship.delete({
            where: {
                id: friendRequestId
            }
        });
    }

    public async acceptFriendRequest(
        user: SessionPayload,
        friendRequestId: bigint
    ) {
        const friendRequest = await this.findFriendRequestById(friendRequestId);

        if (!friendRequest) {
            throw new NotFoundException('친구 요청 정보가 존재하지 않습니다.');
        }

        if (friendRequest.status !== FriendshipStatus.PENDING) {
            throw new BadRequestException('대기 중인 친구 요청이 아닙니다.');
        }

        if (friendRequest.addresseeId !== user.userId) {
            throw new BadRequestException('수신자 본인만 수락할 수 있습니다.');
        }

        await prisma.friendship.update({
            where: {
                id: friendRequestId
            },
            data: {
                status: FriendshipStatus.ACCEPTED
            }
        });
    }

    public async rejectFriendRequest(
        user: SessionPayload,
        friendRequestId: bigint
    ) {
        const friendRequest = await this.findFriendRequestById(friendRequestId);

        if (!friendRequest) {
            throw new NotFoundException('친구 요청 정보가 존재하지 않습니다.');
        }

        if (friendRequest.status !== FriendshipStatus.PENDING) {
            throw new BadRequestException('대기 중인 친구 요청이 아닙니다.');
        }

        if (friendRequest.addresseeId !== user.userId) {
            throw new BadRequestException('수신자 본인만 거절할 수 있습니다.');
        }

        await prisma.friendship.update({
            where: {
                id: friendRequestId
            },
            data: {
                status: FriendshipStatus.REJECTED
            }
        });
    }
}
