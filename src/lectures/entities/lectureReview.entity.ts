import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';
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

const CONST_RATING_TYPE = {
  ONE: 1,
  TWO: 2,
  THREE: 3,
  FOUR: 4,
  FIVE: 5,
} as const;

export type RATING_TYPE =
  typeof CONST_RATING_TYPE[keyof typeof CONST_RATING_TYPE];

@Entity()
export class LectureReview {
  @ManyToOne(() => Lecture, (lecture) => lecture.questions, { primary: true })
  @JoinColumn()
  lecture: Lecture;

  @ManyToOne(() => User, (user) => user.questions, { primary: true })
  @JoinColumn()
  student: User;

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
    example: 1,
    description: '강의 평점',
  })
  @IsEnum(CONST_RATING_TYPE)
  @IsNotEmpty()
  @Column('enum', {
    enum: CONST_RATING_TYPE,
  })
  rating: RATING_TYPE;

  @ApiProperty({
    example: '최고의 강의입니다.',
    description: '강의 리뷰 내용',
  })
  @IsString()
  @IsNotEmpty()
  @Column('varchar')
  review: string;
}
