import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiBearerAuth, ApiOkResponse, ApiTags } from '@nestjs/swagger';

import { APP_ROUTES } from '../../constants/app.constants';
import { Public } from '../../decorators/public-route.decorator';
import { UserLoginDto } from '../users/dto/user-login-dto';
import { AuthService } from './auth.service';
import { LoginPayloadDto } from './dto/login-response.dto';
import { RequestWithUser } from './dto/request-with-user.dto';
import { UserRegisterDto } from './dto/user-register.dto';

@ApiTags(APP_ROUTES.AUTH)
@Controller({
  path: APP_ROUTES.AUTH,
  version: '1',
})
export class AuthController {
  constructor(private readonly service: AuthService) {}

  @Public()
  @Post('/register')
  @HttpCode(HttpStatus.OK)
  async register(@Body() createUserDto: UserRegisterDto): Promise<void> {
    return this.service.register(createUserDto);
  }
  @Public()
  @Post('/login')
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({
    type: LoginPayloadDto,
    description: 'Login user with email and password',
  })
  async login(@Body() loginDto: UserLoginDto): Promise<LoginPayloadDto> {
    return this.service.login(loginDto);
  }

  @ApiBearerAuth()
  @Post('/refresh')
  @UseGuards(AuthGuard('jwt-refresh'))
  @HttpCode(HttpStatus.OK)
  public refresh(@Req() request: RequestWithUser): Promise<LoginPayloadDto> {
    return this.service.refreshToken({
      sessionId: request.user.sessionId,
      hash: request.user.hash,
    });
  }

  @ApiBearerAuth()
  @Post('logout')
  @UseGuards(AuthGuard('jwt'))
  @HttpCode(HttpStatus.NO_CONTENT)
  public async logout(@Req() request: RequestWithUser): Promise<void> {
    await this.service.logout({
      sessionId: request.user.sessionId,
    });
  }
}
