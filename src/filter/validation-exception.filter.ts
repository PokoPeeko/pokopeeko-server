import { ArgumentsHost, Catch, ExceptionFilter, HttpStatus } from "@nestjs/common";
import { ValidationException } from "../common/exception/validation.exception";
import { GlobalResponse } from "../common/dto/global-response.dto";
import { Response } from "express";

@Catch(ValidationException)
export class ValidationExceptionFilter implements ExceptionFilter {
  catch(exception: ValidationException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const exceptionResponse = exception.getResponse();

    const status = HttpStatus.BAD_REQUEST;

    const errors = (exceptionResponse as any).errors;

    const globalResponse: GlobalResponse = {
      success: false,
      message: 'Validation Error',
      errors
    };

    response
      .status(status)
      .json(globalResponse);
  }
}
