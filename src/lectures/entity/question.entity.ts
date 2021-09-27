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

  @Column('varchar')
  questionTitle: string;

  @Column('varchar')
  questionDescription: string;

  @Column('varchar')
  answerTitle: string;

  @Column('varchar')
  answerDescription: string;
}
