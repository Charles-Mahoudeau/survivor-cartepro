import { Controller, Get, Query, Req } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import type { Request } from 'express';
import { ROLES } from '@/config/auth/auth.constants';
import { CurrentUser } from '../decorators/current-user.decorator';
import { Roles } from '../decorators/roles.decorator';
import { GetMeDoc, ListUsersDoc } from '../docs';
import { AuthService } from '../services/auth.service';
import { toSessionUser } from '../services/helpers/user.helper';
import {
  ListUsersQueryDto,
  SessionUserDto,
  UserListDto,
} from '../validators/auth.dto';
import type { AuthUser } from '@/config/auth/auth';

/**
 * The routes this API owns around authentication.
 *
 * Signing up, signing in and signing out are not here: Better Auth serves them
 * itself under `/auth`, and the handler mounted at that prefix answers every
 * request below it — including the ones it does not recognise. Nothing Nest
 * declares under `/auth` would ever be reached.
 */
@ApiTags('Auth')
@Controller()
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Get('me')
  @GetMeDoc()
  me(@CurrentUser() user: AuthUser): SessionUserDto {
    return toSessionUser(user);
  }

  @Get('admin/users')
  @Roles(ROLES.ADMIN)
  @ListUsersDoc()
  async listUsers(
    @Req() request: Request,
    @Query() query: ListUsersQueryDto,
  ): Promise<UserListDto> {
    const { users, total } = await this.authService.listUsers(
      request.headers,
      query,
    );

    return { users: users.map(toSessionUser), total };
  }
}
