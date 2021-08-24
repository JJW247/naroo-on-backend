import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  Length,
} from 'class-validator';
import { Common } from 'src/common/entities/common.entity';
import { Lectures } from 'src/lectures/entities/lectures.entity';
import { Reviews } from 'src/lectures/entities/reviews.entity';
import { UserLecture } from 'src/lectures/entities/userLecture.entity';
import { Column, Entity, OneToMany } from 'typeorm';

const ROLE_TYPE = {
  ADMIN: 'admin',
  STUDENT: 'student',
  TEACHER: 'teacher',
} as const;

export type ROLE_TYPE = typeof ROLE_TYPE[keyof typeof ROLE_TYPE];

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

  @ApiProperty({
    example: 'student',
    description: '유저 타입',
  })
  @IsEnum(ROLE_TYPE)
  @IsOptional()
  @Column('enum', { enum: ROLE_TYPE, default: ROLE_TYPE.STUDENT })
  role: ROLE_TYPE;

  @ApiProperty({
    example: '안녕하세요 노드 1타 강사 h662입니다.',
    description: '강사 자기소개',
  })
  @IsString()
  @IsOptional()
  @Column('varchar', { default: null })
  introduce: string;

  @OneToMany(() => Lectures, (lectures) => lectures.teacher)
  teach_lectures: Lectures[];

  @OneToMany(() => UserLecture, (userLecture) => userLecture.lecture)
  learn_lectures: Lectures[];

  @OneToMany(() => Reviews, (reviews) => reviews.lecture)
  reviews: Reviews[];
}
