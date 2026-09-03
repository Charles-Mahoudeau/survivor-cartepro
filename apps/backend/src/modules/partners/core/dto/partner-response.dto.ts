import { ApiProperty } from '@nestjs/swagger';
import { Expose, Type } from 'class-transformer';

class PartnerCategorySummaryDto {
  @ApiProperty()
  @Expose()
  slug: string;

  @ApiProperty()
  @Expose()
  displayName: string;
}

export class PartnerResponseDto {
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
}
