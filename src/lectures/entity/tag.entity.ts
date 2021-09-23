import { IsNotEmpty, IsString } from 'class-validator';
import { Common } from '../../common/entity/common.entity';
import { Column, Entity, OneToMany } from 'typeorm';
import { LectureTag } from './lectureTag.entity';

@Entity()
export class Tag extends Common {
  @OneToMany(() => LectureTag, (lectureTag) => lectureTag.tag)
  lectureTags: LectureTag[];

  @IsString()
  @IsNotEmpty()
  @Column('varchar', { unique: true })
  name: string;
}
