import { ArgumentsHost, Catch, ExceptionFilter, HttpException, HttpStatus, UnauthorizedException } from "@nestjs/common";
import { GlobalResponse } from "../common/dto/global-response.dto";
import { Request, Response } from 'express';
import { ValidationException } from "../common/exception/validation.exception";
import { WsException } from "@nestjs/websockets";
import { Socket } from 'socket.io';

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  catch(exception: any, host: ArgumentsHost) {
    const contextType = host.getType<'http' | 'ws'>();

    if (contextType == 'http') {
      this.handleHttpException(exception, host);
      return;
    }

    if (contextType == 'ws') {
      this.handleWsException(exception, host);
      return;
    }

    console.error('지원하지 않는 예외 컨텍스트', {
      contextType,
      exception
    });
  }

  private handleHttpException(
    exception: unknown,
    host: ArgumentsHost
  ) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    if (exception instanceof ValidationException) {
      const exceptionResponse =
        exception.getResponse() as {
          errors?: unknown;
        };

      response.status(HttpStatus.BAD_REQUEST).json({
        success: false,
        message: 'Validation Error',
        errors: exceptionResponse.errors
      } satisfies GlobalResponse);

      return;
    }

    if (exception instanceof HttpException) {
      const status = exception.getStatus();
      const exceptionResponse = exception.getResponse();

      const message = this.extractMessage(
        exceptionResponse,
      );

      response.status(status).json({
        success: false,
        message,
      } satisfies GlobalResponse);

      return;
    }

    console.error('Unexpected HTTP error:', {
      error: exception,
      stack:
        exception instanceof Error
          ? exception.stack
          : undefined,
      url: request.url,
      method: request.method,
    });

    response
      .status(HttpStatus.INTERNAL_SERVER_ERROR)
      .json({
        success: false,
        message: 'An unexpected error occurred',
      } satisfies GlobalResponse);
  }

  private handleWsException(
    exception: unknown,
    host: ArgumentsHost,
  ): void {
    const client = host.switchToWs().getClient<Socket>();

    if (exception instanceof ValidationException) {
      const exceptionResponse =
        exception.getResponse() as {
          errors?: unknown;
        };

      client.emit('exception', {
        success: false,
        code: 'VALIDATION_ERROR',
        message: 'Validation Error',
        errors: exceptionResponse.errors,
      });

      return;
    }

    if (exception instanceof WsException) {
      const exceptionResponse = exception.getError();

      if (typeof exceptionResponse === 'string') {
        client.emit('exception', {
          success: false,
          code: 'WS_ERROR',
          message: exceptionResponse,
        });

        return;
      }

      client.emit('exception', {
        success: false,
        ...(exceptionResponse as Record<string, unknown>),
      });

      return;
    }

    if (exception instanceof UnauthorizedException) {
      client.emit('exception', {
        success: false,
        code: 'WS_ERROR',
        message: exception.message,
      });

      client.disconnect();
      return;
    }

    if (exception instanceof HttpException) {
      client.emit('exception', {
        success: false,
        code: 'WS_ERROR',
        message: this.extractMessage(
          exception.getResponse(),
        ),
      });

      return;
    }

    console.error('Unexpected WebSocket error:', {
      error: exception,
      stack:
        exception instanceof Error
          ? exception.stack
          : undefined,
      socketId: client.id,
    });

    client.emit('exception', {
      success: false,
      code: 'INTERNAL_SERVER_ERROR',
      message: 'An unexpected error occurred',
    });
  }

  private extractMessage(
    exceptionResponse: string | object,
  ): string {
    if (typeof exceptionResponse === 'string') {
      return exceptionResponse;
    }

    const message = (
      exceptionResponse as {
        message?: string | string[];
      }
    ).message;

    if (Array.isArray(message)) {
      return message.join(', ');
    }

    return message ?? 'An unexpected error occurred';
  }
}
