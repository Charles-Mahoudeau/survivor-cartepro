import {
  ApiProperty,
  ApiPropertyOptional,
  ApiSchema,
  IntersectionType,
} from '@nestjs/swagger';
import { IsEnum, IsOptional, IsUUID } from 'class-validator';
import { PaginationQueryDto } from '@/common/pagination';
import { PeriodQueryDto } from '@/common/period';
import { AuditAction } from '@/modules/audit/enums/audit-action.enum';

export class ListAuditQueryDto extends IntersectionType(
  PaginationQueryDto,
  PeriodQueryDto,
) {
  @ApiPropertyOptional({
    description: 'Filter by the account that performed the operation.',
  })
  @IsOptional()
  @IsUUID()
  actorId?: string;

  @ApiPropertyOptional({
    enum: AuditAction,
    description: 'Filter by the recorded action.',
  })
  @IsOptional()
  @IsEnum(AuditAction)
  action?: AuditAction;
}

@ApiSchema({ name: 'AuditEntry' })
export class AuditResponseDto {
  @ApiProperty() id: string;
  @ApiProperty() occurredAt: Date;
  @ApiProperty({ nullable: true }) actorId: string | null;
  @ApiProperty({ nullable: true }) actorRole: string | null;
  @ApiProperty({ enum: AuditAction }) action: AuditAction;
  @ApiProperty() targetType: string;
  @ApiProperty({ nullable: true }) targetId: string | null;

  @ApiProperty({
    nullable: true,
    type: 'object',
    additionalProperties: true,
    description: 'Action-specific detail. Shape varies by action.',
  })
  payload: Record<string, unknown> | null;

  @ApiProperty({ nullable: true }) ip: string | null;
  @ApiProperty({ nullable: true }) previousHash: string | null;
  @ApiProperty() hash: string;
}

@ApiSchema({ name: 'AuditPage' })
export class AuditPageResponseDto {
  @ApiProperty({ type: () => [AuditResponseDto] })
  items: AuditResponseDto[];

  @ApiProperty({ nullable: true }) nextCursor: string | null;
  @ApiProperty() hasMore: boolean;
}
