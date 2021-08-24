import { IsNotEmpty, IsString } from 'class-validator';
import { Common } from 'src/common/entities/common.entity';
import { Lecture } from 'src/lectures/entities/lecture.entity';
import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';

@Entity()
export class Notice extends Common {
  @ManyToOne(() => Lecture, (lecture) => lecture.notices)
  @JoinColumn()
  lecture: Lecture;

  @IsString()
  @IsNotEmpty()
  @Column('varchar')
  title: string;

  @IsString()
  @IsNotEmpty()
  @Column('varchar')
  description: string;
}
