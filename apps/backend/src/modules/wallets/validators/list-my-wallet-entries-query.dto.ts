import { IntersectionType } from '@nestjs/swagger';
import { PaginationQueryDto } from '@/common/pagination';
import { PeriodQueryDto } from '@/common/period';

/** What a caller may put on the movement history: a page, and a period. */
export class ListMyWalletEntriesQueryDto extends IntersectionType(
  PaginationQueryDto,
  PeriodQueryDto,
) {}
