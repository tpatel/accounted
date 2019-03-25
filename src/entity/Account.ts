import {
  getManager,
  Entity,
  BaseEntity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
  ManyToMany,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Organization } from './Organization';
import { Token } from './Token';
import { Role } from './Role';
import * as bcrypt from 'bcrypt';

const saltRounds = 10;
const emailVerificationType = 'email-verification';
const passwordResetType = 'passord-reset';

const minute = 60;
const hour = 60 * minute;
const day = 24 * hour;

@Entity()
export class Account extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

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

  static async registerAccount(
    name: string,
    email: string,
    password: string
  ): Promise<Account> {
    const account = new Account();
    account.name = name;
    account.email = email;
    await account.setPassword(password);
    await account.save();
    return account;
  }

  static async authenticate(email: string, password: string): Promise<Account> {
    const account = await getManager()
      .createQueryBuilder(Account, 'account')
      .where('account.email = :email', { email: email })
      .getOne();
    if (!account) {
      return null;
    }
    const match = await bcrypt.compare(password, account.password_hash);
    return match ? account : null;
  }

  async setPassword(password: string): Promise<void> {
    const hashed = await bcrypt.hash(password, saltRounds);
    this.password_hash = hashed;
  }

  static async updatePassword(
    email: string,
    oldPassword: string,
    newPassword: string
  ): Promise<Account> {
    const account = await Account.authenticate(email, oldPassword);
    if (!account) {
      return null;
    }
    await account.setPassword(newPassword);
    await account.save();
    return account;
  }

  async createEmailVerificationToken(): Promise<string> {
    const token = new Token();
    token.account = this;
    token.type = emailVerificationType;
    token.ttl = 2 * day;
    await token.save();
    return token.id;
  }

  async verifyEmail(emailToken: string): Promise<boolean> {
    const token = await getManager()
      .createQueryBuilder(Token, 'token')
      .innerJoin('token.account', 'account', 'account.id = :accountId', {
        accountId: this.id,
      })
      .where('token.id = :tokenId', { tokenId: emailToken })
      .andWhere('token.created_at + token.ttl < :now', {
        now: new Date().toISOString(),
      })
      .andWhere('token.used = false')
      .andWhere('token.type = :tokenType', { tokenType: emailVerificationType })
      .getOne();
    if (!token) {
      return false;
    }
    this.verified_email = true;
    await this.save();
    token.used = true;
    await token.save();
    return true;
  }

  async createPasswordResetToken(): Promise<string> {
    const token = new Token();
    token.account = this;
    token.type = passwordResetType;
    token.ttl = 15 * minute;
    await token.save();
    return token.id;
  }

  async resetPassword(
    emailToken: string,
    newPassword: string
  ): Promise<boolean> {
    const token = await getManager()
      .createQueryBuilder(Token, 'token')
      .where('token.id = :tokenId', { tokenId: emailToken })
      .andWhere('token.created_at + token.ttl < :now', {
        now: new Date().toISOString(),
      })
      .andWhere('token.used = false')
      .andWhere('token.type = :tokenType', { tokenType: passwordResetType })
      .getOne();
    if (!token) {
      return false;
    }
    await this.setPassword(newPassword);
    await this.save();
    token.used = true;
    await token.save();
    return true;
  }
}
