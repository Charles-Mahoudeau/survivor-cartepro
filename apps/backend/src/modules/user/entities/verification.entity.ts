import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryColumn,
  UpdateDateColumn,
} from 'typeorm';

/**
 * Short-lived proofs: an email change, a password reset, an address
 * confirmation. Empty in this lot, since nothing sends mail yet.
 *
 * `identifier` is not unique — an address can have several pending proofs — so
 * the index is a plain one.
 */
@Entity('verification')
export class Verification {
  @PrimaryColumn('uuid', { default: () => 'uuidv7()' })
  id: string;

  @Index()
  @Column('text')
  identifier: string;

  @Column('text')
  value: string;

  @Column('timestamptz')
  expiresAt: Date;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;
}
