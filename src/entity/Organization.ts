import {Entity, PrimaryGeneratedColumn} from "typeorm";

@Entity()
export class Organization {

  @PrimaryGeneratedColumn("uuid")
  id: number;

}
