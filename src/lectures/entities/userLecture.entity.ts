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
import { Users } from 'src/users/entities/users.entity';
import { Column, Entity, JoinColumn, ManyToOne, OneToMany } from 'typeorm';

const LECTURE_STATUS = {
  APPLY: 'apply',
  REJECT: 'reject',
  INVISIBLE: 'invisible',
  VISIBLE: 'visible',
} as const;

export type LECTURE_STATUS = typeof LECTURE_STATUS[keyof typeof LECTURE_STATUS];

@Entity()
export class UserLecture extends Common {
  @ApiProperty({
    example: 'visible',
    description: '강의 현황',
  })
  @IsEnum(LECTURE_STATUS)
  @IsOptional()
  @Column('enum', { enum: LECTURE_STATUS, default: LECTURE_STATUS.VISIBLE })
  status: LECTURE_STATUS;

  @ManyToOne(() => Users, (users) => users.id)
  @JoinColumn()
  user: Users;

  @ManyToOne(() => Lectures, (lectures) => lectures.id)
  @JoinColumn()
  lecture: Lectures;
}
