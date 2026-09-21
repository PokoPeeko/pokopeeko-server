import { createParamDecorator, ExecutionContext, PipeTransform, Type } from '@nestjs/common';

const DeviceIdParam = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();

    return request.headers['x-device-id'];
  }
);

export const DeviceId = (
  ...pipes: Array<PipeTransform | Type<PipeTransform>>
): ParameterDecorator => {
  return DeviceIdParam(undefined, ...pipes);
}
