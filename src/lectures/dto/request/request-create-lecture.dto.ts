import {
  IsArray,
  IsDateString,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUrl,
} from 'class-validator';

export class RequestCreateLectureDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsNotEmpty()
  description: string;

  @IsUrl()
  @IsOptional()
  thumbnail: string;

  @IsArray()
  @IsOptional()
  images: string[];

  @IsDateString()
  @IsOptional()
  expiredAt: Date;

  @IsString()
  @IsNotEmpty()
  teacherName: string;

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
