import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional } from 'class-validator';
import { PaginationQueryDto } from '@/common/pagination';
import { PartnerStatus } from '@/modules/partners/core';

export class ListPartnerApplicationsQueryDto extends PaginationQueryDto {
  @ApiPropertyOptional({
    enum: PartnerStatus,
    default: PartnerStatus.PENDING,
    description: 'Filter the review queue by status',
  })
  @IsOptional()
  @IsEnum(PartnerStatus)
  status: PartnerStatus = PartnerStatus.PENDING;
}
