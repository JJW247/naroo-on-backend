import { ApiProperty } from '@nestjs/swagger';
import {
  IsArray,
  IsDate,
  IsEnum,
  IsOptional,
  IsString,
  IsUrl,
} from 'class-validator';
import { Common } from 'src/common/entities/common.entity';
import { Users } from 'src/users/entities/users.entity';
import {
  Column,
  Entity,
  JoinColumn,
  JoinTable,
  ManyToMany,
  ManyToOne,
  OneToMany,
} from 'typeorm';
import { Reviews } from './reviews.entity';

enum LectureType {
  ONLINE = 'online',
  OFFLINE = 'offline',
}

@Entity()
export class Lectures extends Common {
  @ApiProperty({
    example: 'NestJS/ReactJS 트위터 클론 강의',
    description: '강의 제목',
  })
  @IsString()
  @Column('varchar')
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
  @IsEnum(LectureType)
  @IsOptional()
  @Column('enum', {
    enum: LectureType,
    default: LectureType.ONLINE,
  })
  type: LectureType;

  @ApiProperty({
    example: '아마존s3url을 입력해주세요 나중에 꼮',
    description: '썸네일 이미지 주소',
  })
  @IsUrl()
  @IsOptional()
  // 디폴트 값을 나중에 마포런 기본 썸네일 이미지 디폴드 넣기
  @Column('varchar')
  thumbnail: string;

  @ApiProperty({
    example:
      '[아마존s3url을 입력해주세요 나중에 꼮, 아마존s3url을 입력해주세요 나중에 꼮]',
    description: '강의 설명 페이지 이미지 리스트',
  })
  @IsArray()
  @IsOptional()
  @Column('varchar', { default: [] })
  images: string[];

  @ApiProperty({
    example: '2021-08-15 18:09:27.821235',
    description: '오프라인 강의 만료 기간',
  })
  @IsDate()
  @IsOptional()
  // 디폴트 값이 null 아닐경우 { default: null } 추가
  @Column('date')
  expiredAt: Date;

  @ManyToOne(() => Users, (users) => users.lectures)
  @JoinColumn()
  teacher: Users;

  @OneToMany(() => Reviews, (reviews) => reviews.lecture)
  reviews: Reviews[];
}
