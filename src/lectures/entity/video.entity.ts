import { ApiProperty } from '@nestjs/swagger';
import { Common } from '../../common/entity/common.entity';
import { Lecture } from '../../lectures/entity/lecture.entity';
import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';

@Entity()
export class Video extends Common {
  @ApiProperty({
    example: '1',
    description: '강의 ID',
  })
  @ManyToOne(() => Lecture, (lecture) => lecture.videos, {
    primary: true,
    onUpdate: 'CASCADE',
    onDelete: 'CASCADE',
  })
  @JoinColumn()
  lecture: Lecture;

  @ApiProperty({
    example: 'http://~~~',
    description: '비메오 동영상 URL',
  })
  @Column('varchar')
  url: string;

  @ApiProperty({
    example: '1강 : ~~~',
    description: '강의 설명',
  })
  @Column('varchar')
  title: string;
}
