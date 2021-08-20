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
import { Column, Entity, OneToMany } from 'typeorm';

enum RoleType {
  ADMIN = 'admin',
  STUDENT = 'student',
  TEACHER = 'teacher',
}

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
  @IsEnum(RoleType)
  @IsOptional()
  @Column('enum', { enum: RoleType, default: RoleType.STUDENT })
  role: RoleType;

  @ApiProperty({
    example: '안녕하세요 노드 1타 강사 h662입니다.',
    description: '강사 자기소개',
  })
  @IsString()
  @IsOptional()
  @Column('varchar')
  introduce: string;

  @OneToMany(() => Lectures, (lectures) => lectures.teacher)
  lectures: Lectures[];
}
