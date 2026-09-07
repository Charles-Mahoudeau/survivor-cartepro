import { ApiProperty } from '@nestjs/swagger';
import { Expose, Type } from 'class-transformer';
import {
  PartnerCategorySummaryDto,
  PartnerStatus,
} from '@/modules/partners/core';
import { PartnerApplicationOwnerSummaryDto } from './partner-application-owner-summary.dto';

export class PartnerApplicationDetailResponseDto {
  @ApiProperty()
  @Expose()
  id: string;

  @ApiProperty()
  @Expose()
  legalName: string;

  @ApiProperty()
  @Expose()
  tradeName: string;

  @ApiProperty()
  @Expose()
  siren: string;

  @ApiProperty()
  @Expose()
  businessPurpose: string;

  @ApiProperty({ enum: PartnerStatus })
  @Expose()
  status: PartnerStatus;

  @ApiProperty()
  @Expose()
  addressLine: string;

  @ApiProperty()
  @Expose()
  postalCode: string;

  @ApiProperty()
  @Expose()
  city: string;

  @ApiProperty()
  @Expose()
  latitude: number;

  @ApiProperty()
  @Expose()
  longitude: number;

  @ApiProperty({ type: () => [PartnerCategorySummaryDto] })
  @Expose()
  @Type(() => PartnerCategorySummaryDto)
  categories: PartnerCategorySummaryDto[];

  @ApiProperty({ type: () => PartnerApplicationOwnerSummaryDto })
  @Expose()
  @Type(() => PartnerApplicationOwnerSummaryDto)
  owner: PartnerApplicationOwnerSummaryDto;

  @ApiProperty()
  @Expose()
  createdAt: Date;

  @ApiProperty()
  @Expose()
  updatedAt: Date;
}
