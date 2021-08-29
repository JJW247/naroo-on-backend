import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsOptional } from 'class-validator';
import { Lecture } from 'src/lectures/entities/lecture.entity';
import { User } from 'src/users/entities/user.entity';
import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
} from 'typeorm';

export const CONST_LECTURE_STATUS = {
  APPLY: 'apply',
  REJECT: 'reject',
  INVISIBLE: 'invisible',
  ACCEPT: 'accept',
} as const;

export type LECTURE_STATUS =
  typeof CONST_LECTURE_STATUS[keyof typeof CONST_LECTURE_STATUS];

@Entity()
export class StudentLecture {
  @ManyToOne(() => User, (user) => user.studentLectures, { primary: true })
  @JoinColumn()
  user: User;

  @ManyToOne(() => Lecture, (lecture) => lecture.studentLectures, {
    primary: true,
  })
  @JoinColumn()
  lecture: Lecture;

  @ApiProperty({
    example: '2021-08-15 18:09:27.821235',
    description: '생성된 시간',
  })
  @CreateDateColumn()
  createdAt: Date;

  @ApiProperty({
    example: '2021-08-15 18:09:27.821235',
    description: '수정된 시간',
  })
  @CreateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn()
  deletedAt: Date;

  @ApiProperty({
    example: 'visible',
    description: '강의 현황',
  })
  @IsEnum(CONST_LECTURE_STATUS)
  @IsOptional()
  @Column('enum', {
    enum: CONST_LECTURE_STATUS,
    default: null,
  })
  status: LECTURE_STATUS;
}
