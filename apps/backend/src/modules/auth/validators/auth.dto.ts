import { ApiProperty, ApiPropertyOptional, ApiSchema } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt, IsOptional, IsString, Max, Min } from 'class-validator';
import { ROLES } from '@/config/auth/auth.constants';

const LIST_USERS_MAX_LIMIT = 100;
const LIST_USERS_DEFAULT_LIMIT = 20;

@ApiSchema({ name: 'SessionUser' })
export class SessionUserDto {
  @ApiProperty({ example: 'cfQLay5VOCwEcqDy7GnaYbi8EuzVT2IR' })
  id: string;

  @ApiProperty({ example: 'salarie@exemple.fr' })
  email: string;

  @ApiProperty({ example: 'Camille Dupont' })
  name: string;

  @ApiProperty({ enum: Object.values(ROLES), example: ROLES.USER })
  role: string;

  @ApiProperty({
    description: 'Whether the address has been proven. No mailer is wired yet.',
    example: false,
  })
  emailVerified: boolean;

  @ApiProperty({ example: '2026-09-02T13:50:20.762Z' })
  createdAt: Date;
}

@ApiSchema({ name: 'ListUsersQuery' })
export class ListUsersQueryDto {
  @ApiPropertyOptional({
    minimum: 1,
    maximum: LIST_USERS_MAX_LIMIT,
    default: LIST_USERS_DEFAULT_LIMIT,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(LIST_USERS_MAX_LIMIT)
  limit: number = LIST_USERS_DEFAULT_LIMIT;

  @ApiPropertyOptional({ minimum: 0, default: 0 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  offset: number = 0;

  @ApiPropertyOptional({ description: 'Substring matched against the email.' })
  @IsOptional()
  @IsString()
  search?: string;
}

@ApiSchema({ name: 'UserList' })
export class UserListDto {
  @ApiProperty({ type: [SessionUserDto] })
  users: SessionUserDto[];

  @ApiProperty({ description: 'Accounts matching the query, before paging.' })
  total: number;
}
