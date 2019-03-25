import {
  BaseEntity,
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  OneToOne,
  JoinColumn,
  ManyToOne,
} from 'typeorm';
import { Account } from './Account';
import { Organization } from './Organization';

@Entity()
export class Role extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @CreateDateColumn()
  created_at: string;

  @UpdateDateColumn()
  updated_at: string;

  @Column()
  type: string;

  @ManyToOne(type => Account, account => account.roles)
  @JoinColumn()
  account: Account;

  @ManyToOne(type => Organization, organization => organization.roles)
  @JoinColumn()
  organization: Organization;
}
