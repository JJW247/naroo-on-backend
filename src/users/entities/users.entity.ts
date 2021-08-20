import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString, Length } from 'class-validator';
import { Common } from 'src/common/entities/common.entity';
import { Lectures } from 'src/lectures/entities/lectures.entity';
import { Column, Entity, JoinColumn, OneToMany } from 'typeorm';

@Entity()
export class Users extends Common {
  @ApiProperty({
    example: 'h662hong@gmail.com',
    description: '이메일 주소',
  })
  @IsEmail()
  @IsNotEmpty()
  @Column('varchar')
  email: string;

  @ApiProperty({
    example: 'h662',
    description: '닉네임',
  })
  @IsString()
  @Length(2, 10)
  @IsNotEmpty()
  @Column('varchar')
  nickname: string;

  @ApiProperty({
    example: 'P@ssw0rd',
    description: '패스워드',
  })
  @IsString()
  @IsNotEmpty()
  @Column('varchar')
  password: string;

  @OneToMany(() => Lectures, (lectures) => lectures.teacher)
  lectures: Lectures[];
}
