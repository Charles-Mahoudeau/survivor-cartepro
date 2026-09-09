import { ApiProperty, ApiSchema } from '@nestjs/swagger';

/** The frozen shape a third-party system reads an employee balance through. */
@ApiSchema({ name: 'EmployeeBalance' })
export class BalanceResponseDto {
  @ApiProperty({ example: '137.50' }) balance: string;
  @ApiProperty({ example: 'EUR' }) currency: string;
}
