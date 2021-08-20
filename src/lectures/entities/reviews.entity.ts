import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { Common } from 'src/common/entities/common.entity';
import { Users } from 'src/users/entities/users.entity';
import { Column, Entity, JoinColumn, ManyToOne, OneToOne } from 'typeorm';
import { Lectures } from './lectures.entity';

enum RatingType {
  ONE = 1,
  TWO = 2,
  THREE = 3,
  FOUR = 4,
  FIVE = 5,
}

@Entity()
export class Reviews extends Common {
  @ApiProperty({
    example: 1,
    description: '강의 평점',
  })
  @IsEnum(RatingType)
  @IsOptional()
  @Column('enum', { enum: RatingType, default: RatingType.FIVE })
  rating: RatingType;

  @ApiProperty({
    example: '최고의 강의입니다.',
    description: '강의 리뷰 내용',
  })
  @IsString()
  @IsNotEmpty()
  @Column('varchar')
  review: string;

  @OneToOne(() => Users)
  @JoinColumn()
  user: Users;

  @ManyToOne(() => Lectures, (lectures) => lectures.reviews)
  lecture: Lectures;
}
