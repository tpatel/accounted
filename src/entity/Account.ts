import {getManager, Entity, BaseEntity, PrimaryGeneratedColumn, Column, OneToMany, ManyToMany, CreateDateColumn, UpdateDateColumn} from "typeorm";
import {Organization} from "./Organization";
import {Token} from "./Token";
import {Role} from "./Role";
import * as bcrypt from "bcrypt";
const saltRounds = 10;

@Entity()
export class Account extends BaseEntity {

  @PrimaryGeneratedColumn("uuid")
  id: number;

  @CreateDateColumn()
  created_at: string;

  @UpdateDateColumn()
  updated_at: string;

  @Column()
  name: string;

  @Column({
    unique: true,
  })
  email: string;

  @Column({
    //select: false, //Do not return the password hash by default
  })
  password_hash: string;

  @Column({
    default: false,
  })
  verified_email: boolean;

  @OneToMany(type => Token, token => token.account)
  tokens: Token[];

  @OneToMany(type => Role, role => role.account, {
    //eager: true, //Always load the role objects from an account
  })
  roles: Role[];


  static async registerAccount(name: string, email: string, password: string): Promise<Account> {
    const account = new Account();
    account.name = name;
    account.email = email;
    await account.setPassword(password);
    await account.save();
    return account;
  }

  static async authenticate(email: string, password: string): Promise<Account> {
    const account = await getManager()
      .createQueryBuilder(Account, "account")
      .where("account.email = :email", { email: email })
      .getOne();
    if(!account) {
      return null;
    }
    const match = await bcrypt.compare(password, account.password_hash);
    return match ? account : null;
  }

  async setPassword(password: string): Promise<void> {
    const hashed = await bcrypt.hash(password, saltRounds);
    this.password_hash = hashed;
  }

}
