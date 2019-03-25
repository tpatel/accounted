import {
  Entity,
  BaseEntity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Account } from './Account';
import { Role } from './Role';

@Entity()
export class Organization extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @CreateDateColumn()
  created_at: string;

  @UpdateDateColumn()
  updated_at: string;

  @Column({
    unique: true,
  })
  name: string;

  @OneToMany(type => Role, role => role.organization)
  roles: Role[];

  static async registerOrganization(
    name: string,
    owner: Account
  ): Promise<Organization> {
    const organization = new Organization();
    organization.name = name;
    await organization.save();
    const role = new Role();
    role.type = 'owner';
    role.organization = organization;
    role.account = owner;
    await role.save();
    return organization;
  }
}
