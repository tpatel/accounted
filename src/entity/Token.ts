import {
  Entity,
  BaseEntity,
  Check,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Account } from './Account';

@Entity()
export class Token extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @CreateDateColumn()
  created_at: string;

  @UpdateDateColumn()
  updated_at: string;

  @Column()
  type: string;

  @Column()
  ttl: number;

  @Column({
    default: false,
  })
  used: boolean;

  @ManyToOne(type => Account, account => account.tokens)
  account: Account;
}
