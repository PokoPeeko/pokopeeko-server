import { Injectable, NotFoundException } from '@nestjs/common';
import { UpdateProfileRequestDto } from './dto/request/update-profile-request.dto';
import { SessionPayload } from '../auth/interface/session-payload.interface';
import prisma from 'src/database/prisma';

@Injectable()
export class UserService {
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
