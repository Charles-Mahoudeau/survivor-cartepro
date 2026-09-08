import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsString, MaxLength } from 'class-validator';
import { ApplicationDecision } from '@/modules/partners/applications/enums';

export class DecideApplicationDto {
  @ApiProperty({
    enum: ApplicationDecision,
    description: 'Whether the application is approved or refused',
  })
  @IsEnum(ApplicationDecision)
  decision: ApplicationDecision;

  @ApiProperty({ description: 'Why the application is approved or refused' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(1000)
  reason: string;
}
