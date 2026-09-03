import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('api_key')
export class ApiKey {
  @PrimaryColumn('uuid', { default: () => 'uuidv7()' })
  id: string;

  @Index()
  @Column('text', { default: 'default' })
  configId: string;

  @Column('text', { nullable: true })
  name: string | null;

  @Index()
  @Column('text')
  key: string;

  @Column('text', { nullable: true })
  start: string | null;

  @Column('text', { nullable: true })
  prefix: string | null;

  @Index()
  @Column('text')
  referenceId: string;

  @Column('boolean', { nullable: true, default: true })
  enabled: boolean | null;

  @Column('integer', { nullable: true })
  refillInterval: number | null;

  @Column('integer', { nullable: true })
  refillAmount: number | null;

  @Column('timestamptz', { nullable: true })
  lastRefillAt: Date | null;

  @Column('integer', { nullable: true })
  remaining: number | null;

  @Column('boolean', { nullable: true, default: true })
  rateLimitEnabled: boolean | null;

  @Column('integer', { nullable: true, default: 86400000 })
  rateLimitTimeWindow: number | null;

  @Column('integer', { nullable: true, default: 10 })
  rateLimitMax: number | null;

  @Column('integer', { nullable: true, default: 0 })
  requestCount: number | null;

  @Column('timestamptz', { nullable: true })
  lastRequest: Date | null;

  @Column('timestamptz', { nullable: true })
  expiresAt: Date | null;

  @Column('text', { nullable: true })
  permissions: string | null;

  @Column('text', { nullable: true })
  metadata: string | null;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;
}
