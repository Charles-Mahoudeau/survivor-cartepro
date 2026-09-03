import { Type } from 'class-transformer';
import { IsBase64, IsInt, IsOptional, Max, Min } from 'class-validator';
import { DEFAULT_PAGE_LIMIT, MAX_PAGE_LIMIT } from './pagination.constants';

export class PaginationQueryDto {
  @IsOptional()
  @IsBase64({ urlSafe: true })
  cursor?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(MAX_PAGE_LIMIT)
  limit = DEFAULT_PAGE_LIMIT;
}
