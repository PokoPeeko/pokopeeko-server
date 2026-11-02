import { Injectable, NotFoundException } from '@nestjs/common';
import { UpdateProfileRequestDto } from './dto/request/update-profile-request.dto';
import { SessionPayload } from '../auth/interface/session-payload.interface';
import prisma from 'src/database/prisma';

@Injectable()
export class UserService {
    public async findUserById(userId: string) {
        return await prisma.user.findUnique({
            where: { id: userId }
        });
    }

    public async getMyProfile(user: SessionPayload) {
        const userAccount = await this.findUserById(user.userId);

        if (!userAccount) {
            throw new NotFoundException('사용자 정보가 존재하지 않습니다.');
        }

        const profile = {
            id: userAccount.id,
            displayName: userAccount.displayName,
            profileImage: userAccount.profileImage
        };

        return profile;
    }

    public async getUserProfile(targetId: string) {
        const userAccount = await this.findUserById(targetId);

        if (!userAccount) {
            throw new NotFoundException('사용자 정보가 존재하지 않습니다.');
        }

        const profile = {
            id: userAccount.id,
            displayName: userAccount.displayName,
            profileImage: userAccount.profileImage
        };

        return profile;
    }

    public async updateProfile(
        profileImage: Express.Multer.File | undefined,
        user: SessionPayload,
        dto: UpdateProfileRequestDto
    ) {
        const existUser = await prisma.user.findUnique({
            where: { id: user.userId }
        });

        if (!existUser) {
            throw new NotFoundException('사용자 정보가 존재하지 않습니다.');
        }

        return await prisma.user.update({
            where: { id: user.userId },
            data: {
                displayName: dto.displayName,
                profileImage: profileImage?.filename
            },
            select: {
                displayName: true,
                profileImage: true
            }
        });
    }
}
