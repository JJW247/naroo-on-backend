import { ApiProperty } from '@nestjs/swagger';
import { Lecture } from 'src/lectures/entities/lecture.entity';
import {
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
} from 'typeorm';
import { Tag } from './tag.entity';

@Entity()
export class LectureTag {
  @ManyToOne(() => Lecture, (lecture) => lecture.lectureTags, {
    primary: true,
    onUpdate: 'CASCADE',
    onDelete: 'SET NULL',
  })
  @JoinColumn()
  lecture: Lecture;

  @ManyToOne(() => Tag, (tag) => tag.lectureTags, {
    primary: true,
    onUpdate: 'CASCADE',
    onDelete: 'SET NULL',
  })
  @JoinColumn()
  tag: Tag;

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
}
