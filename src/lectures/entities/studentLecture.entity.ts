import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString } from 'class-validator';
import { Lecture } from 'src/lectures/entities/lecture.entity';
import { User } from 'src/users/entities/user.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
} from 'typeorm';

const LECTURE_STATUS = {
  APPLY: 'apply',
  REJECT: 'reject',
  INVISIBLE: 'invisible',
  VISIBLE: 'visible',
} as const;

export type LECTURE_STATUS = typeof LECTURE_STATUS[keyof typeof LECTURE_STATUS];

const RATING_TYPE = {
  ONE: 1,
  TWO: 2,
  THREE: 3,
  FOUR: 4,
  FIVE: 5,
} as const;

export type RATING_TYPE = typeof RATING_TYPE[keyof typeof RATING_TYPE];

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

  @CreateDateColumn()
  deletedAt: Date;

  @ApiProperty({
    example: 'visible',
    description: '강의 현황',
  })
  @IsEnum(LECTURE_STATUS)
  @IsOptional()
  @Column('enum', { enum: LECTURE_STATUS, default: LECTURE_STATUS.VISIBLE })
  status: LECTURE_STATUS;

  @ApiProperty({
    example: 1,
    description: '강의 평점',
  })
  @IsEnum(RATING_TYPE)
  @IsOptional()
  @Column('enum', { enum: RATING_TYPE, default: RATING_TYPE.FIVE })
  rating: RATING_TYPE;

  @ApiProperty({
    example: '최고의 강의입니다.',
    description: '강의 리뷰 내용',
  })
  @IsString()
  @IsOptional()
  @Column('varchar')
  review: string;
}
