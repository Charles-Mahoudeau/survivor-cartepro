import { ApiProperty, ApiSchema } from '@nestjs/swagger';
import { Expose } from 'class-transformer';
import { PartnerStatus } from '../enums/partner-status.enum';

@ApiSchema({ name: 'PartnerLastDecision' })
export class PartnerLastDecisionDto {
  @ApiProperty()
  @Expose()
  reason: string;

  @ApiProperty({ enum: PartnerStatus })
  @Expose()
  toStatus: PartnerStatus;

  @ApiProperty()
  @Expose()
  createdAt: Date;
}
