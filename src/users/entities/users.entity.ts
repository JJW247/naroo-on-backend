import { Column, Entity } from 'typeorm';

@Entity()
export class Users {
  @Column('varchar')
  email: string;

  @Column('varchar')
  nickname: string;

  @Column('varchar')
  password: string;
}
