import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsISO8601, IsOptional } from 'class-validator';

/** The optional bounds of a read window, as a caller writes them on a query. */
export class PeriodQueryDto {
  @ApiPropertyOptional({
    description:
      'Start of the window, ISO 8601. Defaults to 30 days before the end.',
    example: '2026-08-01T00:00:00.000Z',
  })
  @IsOptional()
  @IsISO8601({ strict: true })
  from?: string;

  @ApiPropertyOptional({
    description: 'End of the window, ISO 8601. Open when absent.',
    example: '2026-08-31T23:59:59.999Z',
  })
  @IsOptional()
  @IsISO8601({ strict: true })
  to?: string;
}
