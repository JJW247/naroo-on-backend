import { IsNotEmpty, IsString } from 'class-validator';
import { Common } from '../../common/entity/common.entity';
import { Lecture } from '../../lectures/entity/lecture.entity';
import { User } from '../../users/entity/user.entity';
import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';

@Entity()
export class Question extends Common {
  @ManyToOne(() => Lecture, (lecture) => lecture.questions)
  @JoinColumn()
  lecture: Lecture;

  @ManyToOne(() => User, (user) => user.questions)
  @JoinColumn()
  student: User;

  @IsString()
  @IsNotEmpty()
  @Column('varchar')
  questionTitle: string;

  @IsString()
  @IsNotEmpty()
  @Column('varchar')
  questionDescription: string;

  @ManyToOne(() => User, (user) => user.answers)
  @JoinColumn()
  teacher: User;

  @IsString()
  @IsNotEmpty()
  @Column('varchar')
  answerTitle: string;

  @IsString()
  @IsNotEmpty()
  @Column('varchar')
  answerDescription: string;
}
