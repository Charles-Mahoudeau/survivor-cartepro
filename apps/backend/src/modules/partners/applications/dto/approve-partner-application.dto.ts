import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class ApprovePartnerApplicationDto {
  @ApiProperty({ description: 'Why the application is approved' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(1000)
  reason: string;
}
