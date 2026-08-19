import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { GlobalResponse } from '../common/dto/global-response.dto';
import { map } from 'rxjs';

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

@Injectable()
export class GlobalResponseInterceptor implements NestInterceptor {
  intercept( context: ExecutionContext, next: CallHandler ) {
    if (context.getType() !== 'http') {
      return next.handle();
    }

    return next.handle().pipe(map((result: unknown) => {
      const isEnvelope = isRecord(result) && ('message' in result || 'data' in result);

      const message =
        isEnvelope &&
        typeof result.message === 'string'
          ? result.message
          : 'Request successful';

      const responseData = isEnvelope
        ? 'data' in result
          ? result.data
          : null
        : result ?? null;

      const response: GlobalResponse = {
        success: true,
        message,
        data: responseData,
      };

      return response;
    }));
  }
}