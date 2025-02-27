import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

import { APP_ROUTES } from '../../constants/app.constants';
import { AuthService } from './auth.service';
import { UserRegisterDto } from './dto/user-register.dto';

@ApiTags(APP_ROUTES.AUTH)
@Controller({
  path: APP_ROUTES.AUTH,
  version: '1',
})
export class AuthController {
  constructor(private readonly service: AuthService) {}

  @Post('/register')
  @HttpCode(HttpStatus.OK)
  async register(@Body() createUserDto: UserRegisterDto): Promise<void> {
    return this.service.register(createUserDto);
  }
}
