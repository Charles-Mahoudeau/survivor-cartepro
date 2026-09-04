import { ApiProperty } from '@nestjs/swagger';
import { Expose, Type } from 'class-transformer';
import { PartnerResponseDto } from './partner-response.dto';

export class PartnerListResponseDto {
  @ApiProperty({ type: () => [PartnerResponseDto] })
  @Expose()
  @Type(() => PartnerResponseDto)
  items: PartnerResponseDto[];

  @ApiProperty({ nullable: true })
  @Expose()
  nextCursor: string | null;

  @ApiProperty()
  @Expose()
  hasMore: boolean;
}
