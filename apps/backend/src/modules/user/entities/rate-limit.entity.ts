import { Column, Entity, PrimaryColumn } from 'typeorm';

@Entity('rate_limit')
export class RateLimit {
  @PrimaryColumn('uuid', { default: () => 'uuidv7()' })
  id: string;

  @Column('text', { unique: true })
  key: string;

  @Column('integer')
  count: number;

  @Column('bigint')
  lastRequest: string;
}
