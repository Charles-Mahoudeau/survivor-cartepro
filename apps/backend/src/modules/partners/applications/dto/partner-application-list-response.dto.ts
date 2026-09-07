import { ApiProperty } from '@nestjs/swagger';
import { Expose, Type } from 'class-transformer';
import { PartnerApplicationResponseDto } from './partner-application-response.dto';

export class PartnerApplicationListResponseDto {
  @ApiProperty({ type: () => [PartnerApplicationResponseDto] })
  @Expose()
  @Type(() => PartnerApplicationResponseDto)
  items: PartnerApplicationResponseDto[];

  @ApiProperty({ nullable: true })
  @Expose()
  nextCursor: string | null;

  @ApiProperty()
  @Expose()
  hasMore: boolean;
}
