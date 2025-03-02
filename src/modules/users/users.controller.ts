import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  SerializeOptions,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiCreatedResponse, ApiTags } from '@nestjs/swagger';
import { RoleType } from 'src/common/types/role.type';
import { APP_ROUTES } from 'src/constants/app.constants';
import { Roles } from 'src/decorators/roles.decorator';
import { JwtRolesGuard } from 'src/guards/auth.guard';

import { User } from './domain/user';
import { ChangeRoleDto } from './dto/change-role.dto';
import { CreateUserDto } from './dto/create-user.dto';
import { UserService } from './users.service';

@ApiTags(APP_ROUTES.USERS)
@ApiBearerAuth()
@Roles(RoleType.ADMIN)
@UseGuards(JwtRolesGuard)
@Controller({
  path: APP_ROUTES.USERS,
  version: '1',
})
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Patch(':id/change-role')
  @HttpCode(HttpStatus.OK)
  async changeRole(
    @Param('id', ParseIntPipe) id: number,
    @Body() input: ChangeRoleDto,
  ): Promise<void> {
    return this.userService.changeRole(id, input.roleId);
  }

  @ApiCreatedResponse({
    type: User,
  })
  @SerializeOptions({
    groups: ['admin'],
  })
  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@Body() createProfileDto: CreateUserDto): Promise<User> {
    return this.userService.create(createProfileDto);
  }
}
