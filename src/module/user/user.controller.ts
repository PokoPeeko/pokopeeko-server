import { Body, Controller, Patch, UploadedFile, UseGuards, UseInterceptors } from '@nestjs/common';
import { UserService } from './user.service';
import { SessionAuthGuard } from '../auth/guard/session-auth.guard';
import { GetUser } from 'src/common/decorator/get-user.decorator';
import { type SessionPayload } from '../auth/interface/session-payload.interface';
import { UpdateProfileRequestDto } from './dto/request/update-profile-request.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { randomUUID } from 'node:crypto';
import { extname } from 'node:path';
import { diskStorage } from 'multer';
import { UpdateProfileResponseDto } from './dto/response/update-profile-response.dto';
import { ApiBadRequestResponse, ApiBody, ApiConsumes, ApiExtraModels, ApiInternalServerErrorResponse, ApiNotFoundResponse, ApiOkResponse, ApiOperation, ApiSecurity, ApiTags, ApiUnauthorizedResponse, getSchemaPath } from '@nestjs/swagger';

@ApiTags('User')
@ApiExtraModels(UpdateProfileRequestDto)
@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @UseGuards(SessionAuthGuard)
  @UseInterceptors(
    FileInterceptor('profile_image', {
      storage: diskStorage({
        destination: './uploads/profile',
        filename: (_req, file, callback) => {
          const filename = `${randomUUID()}${extname(file.originalname)}`;

          callback(null, filename);
        }
      })
    })
  )
  @Patch('/profile')
  @ApiOperation({
    summary: '프로필 수정',
    description: '로그인한 사용자의 표시 이름과 프로필 이미지를 수정합니다. x-session-id 헤더에 세션 ID를 전달하고 multipart/form-data를 사용합니다. 표시 이름과 프로필 이미지는 모두 선택사항이며, 생략한 항목은 기존 값을 유지합니다.'
  })
  @ApiSecurity('session')
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    required: false,
    schema: {
      allOf: [
        { $ref: getSchemaPath(UpdateProfileRequestDto) },
        {
          type: 'object',
          properties: {
            profile_image: {
              type: 'string',
              format: 'binary',
              description: '업로드할 프로필 이미지 파일. 생략하면 기존 이미지를 유지합니다.'
            }
          }
        }
      ]
    }
  })
  @ApiOkResponse({
    description: '프로필 수정 완료',
    type: UpdateProfileResponseDto
  })
  @ApiBadRequestResponse({
    description: '표시 이름이 문자열이 아니거나, 1~10자 범위를 벗어나거나, 공백을 포함함'
  })
  @ApiUnauthorizedResponse({
    description: '세션 ID가 없거나, 세션이 유효하지 않거나, 이미 교체됨'
  })
  @ApiNotFoundResponse({
    description: '사용자 정보가 존재하지 않음'
  })
  @ApiInternalServerErrorResponse({
    description: '프로필 수정 또는 파일 저장 중 서버 오류 발생'
  })
  public async updateProfile(
    @UploadedFile() profileImage: Express.Multer.File | undefined,
    @GetUser() user: SessionPayload,
    @Body() dto: UpdateProfileRequestDto
  ): Promise<UpdateProfileResponseDto> {
    const userProfile = await this.userService.updateProfile(profileImage, user, dto);

    return {
      message: '프로필 수정에 성공했습니다.',
      data: userProfile
    };
  }
}
