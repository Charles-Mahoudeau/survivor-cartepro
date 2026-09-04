import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, MaxLength } from 'class-validator';
import { PaginationQueryDto } from '@/common/pagination';

export class ListPartnersQueryDto extends PaginationQueryDto {
  @ApiPropertyOptional({ description: 'Search in partner names and city' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  search?: string;

  @ApiPropertyOptional({ description: 'Filter by category slug' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  category?: string;
}
