import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';

@ApiTags('App')
@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  @ApiOperation({ summary: '서버 기본 응답', description: '인증 없이 기본 인사 응답을 반환합니다. HTTP 전역 접두사 /api가 적용되지 않는 루트 경로입니다.' })
  @ApiOkResponse({
    description: '기본 응답 반환',
    schema: {
      type: 'object',
      required: ['success', 'message', 'data'],
      properties: {
        success: { type: 'boolean', example: true },
        message: { type: 'string', example: 'Request successful' },
        data: { type: 'string', example: 'Hello World!' }
      }
    }
  })
  getHello(): string {
    return this.appService.getHello();
  }
}
