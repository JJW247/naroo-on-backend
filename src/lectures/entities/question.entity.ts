import { IsNotEmpty, IsString } from 'class-validator';
import { Common } from 'src/common/entities/common.entity';
import { Lecture } from 'src/lectures/entities/lecture.entity';
import { User } from 'src/users/entities/user.entity';
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
