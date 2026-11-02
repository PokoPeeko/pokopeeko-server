import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { SessionPayload } from '../auth/interface/session-payload.interface';
import prisma from 'src/database/prisma';
import { FriendshipStatus } from '@prisma/client';
import { UserService } from '../user/user.service';

@Injectable()
export class FriendService {
    constructor(private readonly userService: UserService) {}

    public async areFriends(
        userId: string,
        targetUserId: string
    ) {
        const friendship = await prisma.friendship.findFirst({
            where: {
                OR: [
                    {
                        requesterId: userId,
                        addresseeId: targetUserId
                    },
                    {
                        requesterId: targetUserId,
                        addresseeId: userId
                    }
                ],
                status: FriendshipStatus.ACCEPTED
            },
            select: {
                id: true
            }
        });

        return friendship;
    }

    public async searchFriends(
        user: SessionPayload,
        keyword: string | undefined
    ) {
        const friendships = await prisma.friendship.findMany({
            where: {
                OR: [
                    {
                        requesterId: user.userId,
                        addressee: {
                            displayName: {
                                contains: keyword
                            }
                        }
                    },
                    {
                        addresseeId: user.userId,
                        requester: {
                            displayName: {
                                contains: keyword
                            }
                        }
                    }
                ],
                status: FriendshipStatus.ACCEPTED,
            },
            select: {
                requesterId: true,
                requester: {
                    select: {
                        id: true,
                        displayName: true,
                        profileImage: true
                    }
                },
                addressee: {
                    select: {
                        id: true,
                        displayName: true,
                        profileImage: true
                    }
                }
            }
        });

        const friends = friendships.map(friendship => 
            friendship.requesterId === user.userId
                ? friendship.addressee
                : friendship.requester
        );

        return friends;
    }

    public async removeFriend(
        user: SessionPayload,
        addresseeId: string
    ) {
        const addressee = await this.userService.findUserById(addresseeId);

        if (!addressee) {
            throw new NotFoundException('삭제할 친구의 정보가 존재하지 않습니다.');
        }

        const friendship = await this.areFriends(user.userId, addresseeId);

        if (!friendship) {
            throw new BadRequestException('상대방과 친구 관계가 아닙니다.');
        }

        await prisma.friendship.delete({
            where: {
                id: friendship.id
            }
        });
    }
}
