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
import { Lecture } from 'src/lectures/entities/lecture.entity';
import { LectureNotice } from 'src/lectures/entities/lectureNotice.entity';
import { LectureReview } from 'src/lectures/entities/lectureReview.entity';
import { Question } from 'src/lectures/entities/question.entity';
import { StudentLecture } from 'src/lectures/entities/studentLecture.entity';
import { Column, Entity, OneToMany } from 'typeorm';

export const CONST_ROLE_TYPE = {
  ADMIN: 'admin',
  STUDENT: 'student',
  TEACHER: 'teacher',
} as const;

export type ROLE_TYPE = typeof CONST_ROLE_TYPE[keyof typeof CONST_ROLE_TYPE];

@Entity()
export class User extends Common {
  @ApiProperty({
    example: 'h662hong@gmail.com',
    description: '이메일 주소',
  })
  @IsEmail()
  @IsNotEmpty()
  @Column('varchar', { unique: true })
  email: string;

  @ApiProperty({
    example: 'h662',
    description: '닉네임',
  })
  @IsString()
  @Length(2, 13)
  @IsNotEmpty()
  @Column('varchar', { unique: true })
  nickname: string;

  @ApiProperty({
    example: 'P@ssw0rd',
    description: '패스워드',
  })
  @IsString()
  @IsNotEmpty()
  @Column('varchar')
  password: string;

  @IsString()
  @IsNotEmpty()
  @Column('varchar', { unique: true })
  phone: string;

  @ApiProperty({
    example: 'student',
    description: '유저 타입',
  })
  @IsEnum(CONST_ROLE_TYPE)
  @IsOptional()
  @Column('enum', { enum: CONST_ROLE_TYPE, default: CONST_ROLE_TYPE.STUDENT })
  role: ROLE_TYPE;

  @ApiProperty({
    example: '안녕하세요 노드 1타 강사 h662입니다.',
    description: '강사 자기소개',
  })
  @IsString()
  @IsOptional()
  @Column('varchar', { default: null })
  introduce: string;

  @OneToMany(() => StudentLecture, (studentLecture) => studentLecture.user)
  studentLectures: StudentLecture[];

  @OneToMany(() => Lecture, (lecture) => lecture.teacher)
  teachLectures: Lecture[];

  @OneToMany(() => Question, (question) => question.student)
  questions: Question[];

  @OneToMany(() => Question, (question) => question.teacher)
  answers: Question[];

  @OneToMany(() => LectureReview, (lectureReview) => lectureReview.student)
  lectureReviews: LectureReview[];

  @OneToMany(() => LectureNotice, (lectureNotice) => lectureNotice.creator)
  lectureNotices: LectureNotice[];
}
