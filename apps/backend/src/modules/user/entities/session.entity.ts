import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryColumn,
  UpdateDateColumn,
  type Relation,
} from 'typeorm';
import { User } from './user.entity';

@Entity('session')
export class Session {
  @PrimaryColumn('uuid', { default: () => 'uuidv7()' })
  id: string;

  @Column('text', { unique: true })
  token: string;

  @Column('timestamptz')
  expiresAt: Date;

  @Column('text', { nullable: true })
  ipAddress: string | null;

  @Column('text', { nullable: true })
  userAgent: string | null;

  @Column('text', { nullable: true })
  impersonatedBy: string | null;

  @Index()
  @Column('uuid')
  userId: string;

  @ManyToOne(() => User, (user) => user.sessions, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: Relation<User>;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;
}
