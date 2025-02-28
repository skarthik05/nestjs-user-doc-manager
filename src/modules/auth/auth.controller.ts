import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { ApiOkResponse, ApiTags } from '@nestjs/swagger';

import { APP_ROUTES } from '../../constants/app.constants';
import { UserLoginDto } from '../users/dto/user-login-dto';
import { AuthService } from './auth.service';
import { LoginPayloadDto } from './dto/login-response.dto';
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
  @Post('/login')
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({
    type: LoginPayloadDto,
    description: 'Login user with email and password',
  })
  async login(@Body() loginDto: UserLoginDto): Promise<LoginPayloadDto> {
    return this.service.login(loginDto);
  }
}
