import { PrimaryColumn } from 'typeorm';

export function PrimaryGeneratedUuidV7Column(options?: {
  primaryKeyConstraintName?: string;
}) {
  return PrimaryColumn({
    type: 'uuid',
    default: () => 'uuidv7()',
    nullable: false,
    ...options,
  });
}
