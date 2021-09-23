import { ApiProperty } from '@nestjs/swagger';
import { Common } from '../../common/entity/common.entity';
import { Lecture } from '../../lectures/entity/lecture.entity';
import { User } from '../../users/entity/user.entity';
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
  @Column('varchar')
  title: string;

  @ApiProperty({
    example: '공지사항 내용 입니다.',
    description: '공지사항 내용',
  })
  @Column('varchar')
  description: string;
}
