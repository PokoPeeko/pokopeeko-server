import { ValidationError, ValidationPipe } from '@nestjs/common';
import { ValidationException } from '../common/exception/validation.exception';

type ValidationErrorMap = Record<string, string[]>;

function flattenValidationErrors(
  errors: ValidationError[],
  parentProperty = ''
): ValidationErrorMap {
  const result: ValidationErrorMap = {};

  for (const error of errors) {
    const property = parentProperty
      ? `${parentProperty}.${error.property}`
      : error.property;

    if (error.constraints) {
      result[property] = Object.values(error.constraints);
    }

    if (error.children?.length) {
      Object.assign(
        result,
        flattenValidationErrors(
          error.children,
          property
        )
      );
    }
  }

  return result;
}

export class ErrorValidationPipe extends ValidationPipe {
  constructor() {
    super({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: true,
      validationError: {
        target: false,
        value: false
      },
      exceptionFactory: (validationErrors: ValidationError[]) => {
        const errors = flattenValidationErrors(validationErrors);

        return new ValidationException(errors);
      }
    });
  }
}