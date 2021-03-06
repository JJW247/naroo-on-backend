import { ApiProperty } from '@nestjs/swagger';
import { Common } from '../../common/entity/common.entity';
import { Column, Entity, OneToMany } from 'typeorm';
import { LectureNotice } from './lectureNotice.entity';
import { LectureTag } from './lectureTag.entity';
import { Question } from './question.entity';
import { StudentLecture } from './studentLecture.entity';

@Entity()
export class Lecture extends Common {
  @ApiProperty({
    example: 'NestJS/ReactJS 트위터 클론 강의',
    description: '강의 제목',
  })
  @Column('varchar', { unique: true })
  title: string;

  @ApiProperty({
    example: 'Javascript 기반 풀스택 강의 입니다.',
    description: '강의 설명',
  })
  @Column('varchar')
  description: string;

  @ApiProperty({
    example: '아마존s3url을 입력해주세요 나중에 꼮',
    description: '썸네일 이미지 주소',
  })
  @Column('varchar', {
    default:
      'https://www.contentviewspro.com/wp-content/uploads/2017/07/default_image.png',
  })
  thumbnail: string;

  @ApiProperty({
    example:
      '[아마존s3url을 입력해주세요 나중에 꼮, 아마존s3url을 입력해주세요 나중에 꼮]',
    description: '강의 설명 페이지 이미지 리스트',
  })
  @Column('varchar', { array: true, default: [] })
  images: string[];

  @ApiProperty({
    example: '2021-08-15 18:09:27.821235',
    description: '오프라인 강의 만료 기간',
  })
  @Column('timestamp', { default: null })
  expiredAt: Date;

  @Column('varchar')
  teacherName: string;

  @Column('varchar')
  videoUrl: string;

  @Column('varchar')
  videoTitle: string;

  @OneToMany(() => StudentLecture, (studentLecture) => studentLecture.lecture)
  studentLectures: StudentLecture[];

  @OneToMany(() => Question, (question) => question.lecture)
  questions: Question[];

  @OneToMany(() => LectureTag, (lectureTag) => lectureTag.lecture)
  lectureTags: LectureTag[];

  @OneToMany(() => LectureNotice, (lectureNotice) => lectureNotice.lecture)
  lectureNotices: LectureNotice[];
}
