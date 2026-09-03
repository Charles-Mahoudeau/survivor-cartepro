import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';

export class PartnerCategoryResponseDto {
  @ApiProperty()
  @Expose()
  slug: string;

  @ApiProperty()
  @Expose()
  displayName: string;

  @ApiProperty()
  @Expose()
  partnerCount: number;
}
