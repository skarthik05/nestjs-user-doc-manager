import { HttpException, HttpStatus } from '@nestjs/common';

export class DetailsConflictException<
  T extends string | number,
> extends HttpException {
  constructor(entity: string, field: string, value: T) {
    super(
      `${entity} with ${field} ${value} already exists.`,
      HttpStatus.CONFLICT,
    );
  }
}

export class DetailsNotFoundException<
  T extends string | number,
> extends HttpException {
  constructor(entity: string, field: string, value: T) {
    super(`${entity} with ${field} ${value} not found.`, HttpStatus.NOT_FOUND);
  }
}

export class InvalidPasswordException extends HttpException {
  constructor() {
    super('Invalid password.', HttpStatus.BAD_REQUEST);
  }
}
