import { ApiProperty } from '@nestjs/swagger';
import { Expose, Type } from 'class-transformer';
import { ApplicationResponseDto } from './application-response.dto';

export class ApplicationListResponseDto {
  @ApiProperty({ type: () => [ApplicationResponseDto] })
  @Expose()
  @Type(() => ApplicationResponseDto)
  items: ApplicationResponseDto[];

  @ApiProperty({ nullable: true })
  @Expose()
  nextCursor: string | null;

  @ApiProperty()
  @Expose()
  hasMore: boolean;
}
