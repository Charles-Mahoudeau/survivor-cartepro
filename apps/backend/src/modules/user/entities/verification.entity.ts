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
 * confirmation.
 *
 * The table stays empty in this lot — nothing sends mail yet — but it is part
 * of the schema Better Auth expects, and a missing table is a runtime failure
 * on the first flow that needs one rather than a boot failure.
 *
 * `identifier` is what a row is looked up by, and it is not unique: an address
 * can have several pending proofs at once. Hence the plain index.
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
