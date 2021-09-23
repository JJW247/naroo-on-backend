import { ApiProperty } from '@nestjs/swagger';
import {
  IsArray,
  IsDate,
  IsEnum,
  IsOptional,
  IsString,
  IsUrl,
} from 'class-validator';
import { Common } from '../../common/entity/common.entity';
import { User } from '../../users/entity/user.entity';
import { Column, Entity, JoinColumn, ManyToOne, OneToMany } from 'typeorm';
import { LectureNotice } from './lectureNotice.entity';
import { LectureReview } from './lectureReview.entity';
import { LectureTag } from './lectureTag.entity';
import { Question } from './question.entity';
import { StudentLecture } from './studentLecture.entity';
import { Video } from './video.entity';

export const CONST_LECTURE_TYPE = {
  ONLINE: 'online',
  OFFLINE: 'offline',
} as const;

export type LECTURE_TYPE =
  typeof CONST_LECTURE_TYPE[keyof typeof CONST_LECTURE_TYPE];

@Entity()
export class Lecture extends Common {
  @ApiProperty({
    example: 'NestJS/ReactJS 트위터 클론 강의',
    description: '강의 제목',
  })
  @IsString()
  @Column('varchar', { unique: true })
  title: string;

  @ApiProperty({
    example: 'Javascript 기반 풀스택 강의 입니다.',
    description: '강의 설명',
  })
  @IsString()
  @Column('varchar')
  description: string;

  @ApiProperty({
    example: 'online',
    description: '강의 타입 - 온라인 or 오프라인',
  })
  @IsEnum(CONST_LECTURE_TYPE)
  @IsOptional()
  @Column('enum', {
    enum: CONST_LECTURE_TYPE,
    default: CONST_LECTURE_TYPE.ONLINE,
  })
  type: LECTURE_TYPE;

  @ApiProperty({
    example: '아마존s3url을 입력해주세요 나중에 꼮',
    description: '썸네일 이미지 주소',
  })
  @IsUrl()
  @IsOptional()
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
  @IsArray()
  @IsOptional()
  @Column('varchar', { array: true, default: [] })
  images: string[];

  @ApiProperty({
    example: '2021-08-15 18:09:27.821235',
    description: '오프라인 강의 만료 기간',
  })
  @IsDate()
  @IsOptional()
  @Column('timestamp', { default: null })
  expiredAt: Date;

  @ManyToOne(() => User, (user) => user.teachLectures)
  @JoinColumn()
  teacher: User;

  @OneToMany(() => Video, (video) => video.lecture)
  videos: Video[];

  @OneToMany(() => StudentLecture, (studentLecture) => studentLecture.lecture)
  studentLectures: StudentLecture[];

  @OneToMany(() => Question, (question) => question.lecture)
  questions: Question[];

  @OneToMany(() => LectureTag, (lectureTag) => lectureTag.lecture)
  lectureTags: LectureTag[];

  @OneToMany(() => LectureReview, (lectureReview) => lectureReview.lecture)
  lectureReviews: LectureReview[];

  @OneToMany(() => LectureNotice, (lectureNotice) => lectureNotice.lecture)
  lectureNotices: LectureNotice[];
}
