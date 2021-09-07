import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsString } from 'class-validator';
import { Common } from 'src/common/entities/common.entity';
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

@Entity()
export class LectureNotice extends Common {
  @ManyToOne(() => Lecture, (lecture) => lecture.lectureNotices, {
    primary: true,
  })
  @JoinColumn()
  lecture: Lecture;

  @ManyToOne(() => User, (user) => user.lectureNotices, { primary: true })
  @JoinColumn()
  creator: User;

  @ApiProperty({
    example: '공지사항 제목 입니다.',
    description: '공지사항 제목',
  })
  @IsString()
  @IsNotEmpty()
  @Column('varchar')
  title: string;

  @ApiProperty({
    example: '공지사항 내용 입니다.',
    description: '공지사항 내용',
  })
  @IsString()
  @IsNotEmpty()
  @Column('varchar')
  description: string;
}
