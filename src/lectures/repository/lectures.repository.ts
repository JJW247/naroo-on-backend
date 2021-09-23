import { EntityRepository, Repository } from 'typeorm';
import { Lecture } from '../entity/lecture.entity';

@EntityRepository(Lecture)
export class LecturesRepository extends Repository<Lecture> {}
