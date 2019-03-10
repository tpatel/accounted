import {Entity, BaseEntity, Check, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, UpdateDateColumn} from "typeorm";
import {Account} from "./Account";

@Entity()
export class Token extends BaseEntity {

  @PrimaryGeneratedColumn("uuid")
  id: number;

  @CreateDateColumn()
  created_at: string;

  @UpdateDateColumn()
  updated_at: string;

  @Column()
  type: string;

  @Column()
  ttl: number;

  @ManyToOne(type => Account, account => account.tokens)
  account: Account;
}
