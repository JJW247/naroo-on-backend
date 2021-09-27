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

  @IsString({ each: true })
  @IsOptional({ each: true })
  tags: string[];

  @IsString()
  @IsOptional()
  videoUrl: string;

  @IsString()
  @IsOptional()
  videoTitle: string;
}
