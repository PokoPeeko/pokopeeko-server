import { BadRequestException, HttpStatus } from "@nestjs/common";

export class ValidationException extends BadRequestException {
  constructor(errors: Record<string, string[]>) {
    super({
      statusCode: HttpStatus.BAD_REQUEST,
      message: 'Validation Error',
      errors
    });
  }
}
