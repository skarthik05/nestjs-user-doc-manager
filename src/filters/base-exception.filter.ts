import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { TypeORMError } from 'typeorm';

interface ErrorResponse {
  status: string;
  statusCode: number;
  message: string;
  timestamp: string;
  path: string;
}

interface HttpExceptionResponse {
  message: string | string[];
  error?: string;
  statusCode?: number;
}

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const errorResponse = this.createErrorResponse(exception, request.url);

    this.logError(exception);
    response.status(errorResponse.statusCode).json(errorResponse);
  }

  private createErrorResponse(exception: unknown, path: string): ErrorResponse {
    const { statusCode, message } = this.getExceptionDetails(exception);

    return {
      status: 'error',
      statusCode,
      message,
      timestamp: new Date().toISOString(),
      path,
    };
  }

  private getExceptionDetails(exception: unknown): {
    statusCode: number;
    message: string;
  } {
    if (exception instanceof HttpException) {
      return this.handleHttpException(exception);
    }

    if (exception instanceof TypeORMError) {
      return this.handleDatabaseError();
    }

    return this.handleUnknownError();
  }

  private handleHttpException(exception: HttpException) {
    const statusCode = exception.getStatus();
    const response = exception.getResponse();

    let message: string;
    if (typeof response === 'string') {
      message = response;
    } else {
      const exceptionResponse = response as HttpExceptionResponse;
      message = Array.isArray(exceptionResponse.message)
        ? exceptionResponse.message.join(', ')
        : (exceptionResponse.message ?? 'An error occurred');
    }

    return { statusCode, message };
  }

  private handleDatabaseError(): { statusCode: number; message: string } {
    return {
      statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
      message: 'A database error occurred. Please try again later.',
    };
  }

  private handleUnknownError(): { statusCode: number; message: string } {
    return {
      statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
      message: 'An unexpected error occurred.',
    };
  }

  private logError(exception: unknown): void {
    const message =
      exception instanceof Error ? exception.message : 'Unknown error';
    const stack = exception instanceof Error ? exception.stack : undefined;

    this.logger.error(message, stack);
  }
}
