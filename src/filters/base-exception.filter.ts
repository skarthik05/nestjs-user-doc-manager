import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Response } from 'express';
import { QueryFailedError, TypeORMError } from 'typeorm';

@Catch(HttpException, TypeORMError)
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    const { statusCode, message, error } = this.getExceptionDetails(exception);

    response.status(statusCode).json({
      status: 'error',
      message,
      errors: error,
    });
  }

  private getExceptionDetails(exception: unknown): {
    statusCode: number;
    message: string;
    error: unknown;
  } {
    if (exception instanceof HttpException) {
      const exceptionResponse = exception.getResponse();
      const statusCode = exception.getStatus();
      if (typeof exceptionResponse === 'string') {
        return { statusCode, message: exceptionResponse, error: null };
      } else {
        const { message, error } = exceptionResponse as {
          message: unknown;
          error?: string;
        };
        return {
          statusCode,
          message: error ?? 'Something went wrong, please try again later',
          error: message,
        };
      }
    } else if (exception instanceof TypeORMError) {
      this.logDatabaseError(exception);
      return {
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: 'A database error occurred. Please try again later.',
        error: null,
      };
    }
    return {
      statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
      message: 'An unexpected error occurred.',
      error: null,
    };
  }

  private logDatabaseError(exception: TypeORMError): void {
    if (exception instanceof QueryFailedError) {
      this.logger.error(
        `QueryFailedError: ${exception.message}`,
        exception.stack,
      );
    } else {
      this.logger.error(
        `Database Error: ${exception.message}`,
        exception.stack,
      );
    }
  }
}
