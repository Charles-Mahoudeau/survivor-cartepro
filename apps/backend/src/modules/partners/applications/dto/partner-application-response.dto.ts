import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';
import { PartnerStatus } from '@/modules/partners/core';

export class PartnerApplicationResponseDto {
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
  city: string;

  @ApiProperty({ enum: PartnerStatus })
  @Expose()
  status: PartnerStatus;

  @ApiProperty()
  @Expose()
  createdAt: Date;
}
