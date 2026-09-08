import { ApiProperty, ApiSchema } from '@nestjs/swagger';
import { Expose, Type } from 'class-transformer';
import { PartnerStatus } from '../enums/partner-status.enum';
import { PartnerCategorySummaryDto } from './partner-category-summary.dto';
import { PartnerLastDecisionDto } from './partner-last-decision.dto';

@ApiSchema({ name: 'PartnerProfile' })
export class PartnerProfileResponseDto {
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

  @ApiProperty({ type: () => PartnerLastDecisionDto, nullable: true })
  @Expose()
  @Type(() => PartnerLastDecisionDto)
  lastDecision: PartnerLastDecisionDto | null;
}
