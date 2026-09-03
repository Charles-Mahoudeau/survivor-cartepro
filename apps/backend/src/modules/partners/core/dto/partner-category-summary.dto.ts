import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';

export class PartnerCategorySummaryDto {
  @ApiProperty()
  @Expose()
  slug: string;

  @ApiProperty()
  @Expose()
  displayName: string;
}
