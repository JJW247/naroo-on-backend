import { ApiProperty } from '@nestjs/swagger';
import { Lecture } from '../../lectures/entity/lecture.entity';
import { CreateDateColumn, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { Tag } from './tag.entity';

@Entity()
export class LectureTag {
  @ManyToOne(() => Lecture, (lecture) => lecture.lectureTags, {
    primary: true,
    onUpdate: 'CASCADE',
    onDelete: 'CASCADE',
  })
  @JoinColumn()
  lecture: Lecture;

  @ManyToOne(() => Tag, (tag) => tag.lectureTags, {
    primary: true,
    onUpdate: 'CASCADE',
    onDelete: 'CASCADE',
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
