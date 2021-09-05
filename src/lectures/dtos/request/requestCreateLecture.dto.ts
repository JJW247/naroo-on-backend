import {
  IsArray,
  IsDateString,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsUrl,
} from 'class-validator';
import {
  CONST_LECTURE_TYPE,
  LECTURE_TYPE,
} from '../../entities/lecture.entity';

export class RequestCreateLectureDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsNotEmpty()
  description: string;

  @IsEnum(CONST_LECTURE_TYPE)
  @IsOptional()
  type: LECTURE_TYPE;

  @IsUrl()
  @IsOptional()
  thumbnail: string;

  @IsArray()
  @IsOptional()
  images: string[];

  @IsDateString()
  @IsOptional()
  expiredAt: Date;

  @IsNumber()
  @IsNotEmpty()
  teacherId: number;

  @IsArray()
  @IsOptional()
  tags: number[];

  @IsArray()
  @IsNotEmpty()
  videos: {
    url: string;
    title: string;
  }[];
}
